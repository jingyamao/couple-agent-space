"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useCouple } from "@/hooks/use-couple";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

type Mood = {
  id: string;
  userId: string;
  mood: string;
  energy: "LOW" | "MEDIUM" | "HIGH";
  stressLevel: number;
  carePreference: string | null;
  note: string | null;
  checkedAt: string;
  user: { id: string; name: string };
};

const energyOptions = [
  { label: "需要休息", value: "LOW" },
  { label: "状态平稳", value: "MEDIUM" },
  { label: "精力充沛", value: "HIGH" }
];

const energyTones: Record<string, "rose" | "gold" | "teal"> = {
  LOW: "rose",
  MEDIUM: "gold",
  HIGH: "teal"
};

export default function MoodsPage() {
  const { couple } = useCouple();
  const { user } = useAuth();
  const { toast } = useToast();
  const [moods, setMoods] = useState<Mood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMood, setEditingMood] = useState<Mood | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Mood | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [moodText, setMoodText] = useState("");
  const [energy, setEnergy] = useState("MEDIUM");
  const [stressLevel, setStressLevel] = useState(3);
  const [carePreference, setCarePreference] = useState("");
  const [note, setNote] = useState("");

  const fetchMoods = useCallback(async () => {
    if (!couple) return;
    try {
      const result = await apiClient<Mood[]>(
        `/api/couples/${couple.id}/moods`
      );
      return result;
    } catch {
      toast("error", "加载心情记录失败");
      return [];
    }
  }, [couple, toast]);

  useEffect(() => {
    let cancelled = false;
    fetchMoods().then((result) => {
      if (!cancelled && result) {
        setMoods(result);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [fetchMoods]);

  function openCreate() {
    setEditingMood(null);
    setMoodText("");
    setEnergy("MEDIUM");
    setStressLevel(3);
    setCarePreference("");
    setNote("");
    setDialogOpen(true);
  }

  function openEdit(mood: Mood) {
    setEditingMood(mood);
    setMoodText(mood.mood);
    setEnergy(mood.energy);
    setStressLevel(mood.stressLevel);
    setCarePreference(mood.carePreference ?? "");
    setNote(mood.note ?? "");
    setDialogOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!couple) return;
    setIsSaving(true);

    try {
      const body = {
        mood: moodText,
        energy,
        stressLevel,
        carePreference: carePreference || undefined,
        note: note || undefined
      };

      if (editingMood) {
        await apiClient(`/api/couples/${couple.id}/moods/${editingMood.id}`, {
          method: "PATCH",
          body
        });
        toast("success", "心情已更新");
      } else {
        await apiClient(`/api/couples/${couple.id}/moods`, {
          method: "POST",
          body
        });
        toast("success", "心情已记录");
      }
      setDialogOpen(false);
      fetchMoods();
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "操作失败";
      toast("error", msg);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!couple || !deleteConfirm) return;
    try {
      await apiClient(`/api/couples/${couple.id}/moods/${deleteConfirm.id}`, {
        method: "DELETE"
      });
      toast("success", "已删除");
      setDeleteConfirm(null);
      fetchMoods();
    } catch {
      toast("error", "删除失败");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">心情打卡</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          记录心情
        </Button>
      </div>

      {moods.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Sparkles className="mx-auto size-12 text-[var(--muted-foreground)]" />
            <p className="mt-4 text-[var(--muted-foreground)]">
              还没有心情记录
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moods.map((mood) => (
            <Card key={mood.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{mood.user.name}</p>
                    <p className="mt-1 text-lg">{mood.mood}</p>
                  </div>
                  <Badge tone={energyTones[mood.energy]}>
                    {energyOptions.find((e) => e.value === mood.energy)?.label}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-[var(--muted-foreground)]">
                    压力:
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        className={`size-2.5 rounded-full ${
                          level <= mood.stressLevel
                            ? "bg-[var(--primary)]"
                            : "bg-[#e7dfd5]"
                        }`}
                        key={level}
                      />
                    ))}
                  </div>
                </div>

                {mood.carePreference ? (
                  <p className="mt-3 rounded-md bg-[#f7f3ed] p-3 text-sm">
                    {mood.carePreference}
                  </p>
                ) : null}

                {mood.note ? (
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {mood.note}
                  </p>
                ) : null}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {format(new Date(mood.checkedAt), "yyyy-MM-dd HH:mm")}
                  </span>
                  {mood.userId === user?.id ? (
                    <div className="flex gap-1">
                      <Button
                        onClick={() => openEdit(mood)}
                        size="icon"
                        variant="ghost"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        onClick={() => setDeleteConfirm(mood)}
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        title={editingMood ? "编辑心情" : "记录心情"}
      >
        <form className="space-y-4 p-5" onSubmit={handleSave}>
          <Input
            label="今天的心情"
            name="mood"
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="例如：开心、平静、有点累"
            required
            value={moodText}
          />
          <Select
            label="精力状态"
            name="energy"
            onChange={(e) => setEnergy(e.target.value)}
            options={energyOptions}
            value={energy}
          />
          <div className="space-y-1.5">
            <label className="block text-sm text-[var(--muted-foreground)]">
              压力等级: {stressLevel}
            </label>
            <input
              className="w-full accent-[var(--primary)]"
              max={5}
              min={1}
              onChange={(e) => setStressLevel(Number(e.target.value))}
              type="range"
              value={stressLevel}
            />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
              <span>轻松</span>
              <span>很大</span>
            </div>
          </div>
          <Textarea
            label="希望对方怎样关心你"
            name="carePreference"
            onChange={(e) => setCarePreference(e.target.value)}
            placeholder="例如：陪我散散步、给我一个拥抱"
            value={carePreference}
          />
          <Textarea
            label="备注"
            name="note"
            onChange={(e) => setNote(e.target.value)}
            placeholder="其他想说的..."
            value={note}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={() => setDialogOpen(false)}
              type="button"
              variant="outline"
            >
              取消
            </Button>
            <Button disabled={isSaving} type="submit">
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "保存"
              )}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        onClose={() => setDeleteConfirm(null)}
        open={!!deleteConfirm}
        title="确认删除"
      >
        <div className="p-5">
          <p className="text-sm text-[var(--muted-foreground)]">
            确定要删除这条心情记录吗？
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setDeleteConfirm(null)} variant="outline">
              取消
            </Button>
            <Button onClick={handleDelete}>删除</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
