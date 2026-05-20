"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { format, differenceInDays, addYears } from "date-fns";
import { CalendarHeart, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useCouple } from "@/hooks/use-couple";
import { useToast } from "@/components/ui/toast";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Anniversary = {
  id: string;
  title: string;
  happenedAt: string;
  remindDays: number[];
  note: string | null;
};

export default function AnniversariesPage() {
  const { couple } = useCouple();
  const { toast } = useToast();
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Anniversary | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Anniversary | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [happenedAt, setHappenedAt] = useState("");
  const [remindDaysStr, setRemindDaysStr] = useState("30,7,1");
  const [note, setNote] = useState("");

  const fetchAnniversaries = useCallback(async () => {
    if (!couple) return;
    try {
      const result = await apiClient<Anniversary[]>(
        `/api/couples/${couple.id}/anniversaries`
      );
      return result;
    } catch {
      toast("error", "加载纪念日失败");
      return [];
    }
  }, [couple, toast]);

  useEffect(() => {
    let cancelled = false;
    fetchAnniversaries().then((result) => {
      if (!cancelled && result) {
        setAnniversaries(result);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [fetchAnniversaries]);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setHappenedAt("");
    setRemindDaysStr("30,7,1");
    setNote("");
    setDialogOpen(true);
  }

  function openEdit(anniversary: Anniversary) {
    setEditing(anniversary);
    setTitle(anniversary.title);
    setHappenedAt(new Date(anniversary.happenedAt).toISOString().split("T")[0]);
    setRemindDaysStr(anniversary.remindDays.join(","));
    setNote(anniversary.note ?? "");
    setDialogOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!couple) return;
    setIsSaving(true);

    try {
      const remindDays = remindDaysStr
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 0);

      const body = {
        title,
        happenedAt: new Date(happenedAt).toISOString(),
        remindDays,
        note: note || undefined
      };

      if (editing) {
        await apiClient(
          `/api/couples/${couple.id}/anniversaries/${editing.id}`,
          { method: "PATCH", body }
        );
        toast("success", "纪念日已更新");
      } else {
        await apiClient(`/api/couples/${couple.id}/anniversaries`, {
          method: "POST",
          body
        });
        toast("success", "纪念日已添加");
      }
      setDialogOpen(false);
      fetchAnniversaries();
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
      await apiClient(
        `/api/couples/${couple.id}/anniversaries/${deleteConfirm.id}`,
        { method: "DELETE" }
      );
      toast("success", "纪念日已删除");
      setDeleteConfirm(null);
      fetchAnniversaries();
    } catch {
      toast("error", "删除失败");
    }
  }

  function getDaysUntil(happenedAt: string) {
    const date = new Date(happenedAt);
    const now = new Date();
    let next = new Date(now.getFullYear(), date.getMonth(), date.getDate());
    if (next.getTime() < now.getTime()) {
      next = addYears(next, 1);
    }
    return differenceInDays(next, new Date());
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
        <h1 className="text-2xl font-semibold">纪念日</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          添加纪念日
        </Button>
      </div>

      {anniversaries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarHeart className="mx-auto size-12 text-[var(--muted-foreground)]" />
            <p className="mt-4 text-[var(--muted-foreground)]">
              还没有纪念日，添加一个吧
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {anniversaries.map((anniversary) => {
            const daysUntil = getDaysUntil(anniversary.happenedAt);

            return (
              <Card key={anniversary.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{anniversary.title}</h3>
                    <Badge tone={daysUntil <= 7 ? "rose" : daysUntil <= 30 ? "gold" : "teal"}>
                      {daysUntil === 0 ? "就是今天！" : `${daysUntil} 天后`}
                    </Badge>
                  </div>

                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {format(new Date(anniversary.happenedAt), "yyyy年MM月dd日")}
                  </p>

                  {anniversary.note ? (
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      {anniversary.note}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-1">
                    {anniversary.remindDays.map((day) => (
                      <Badge key={day} tone="neutral">
                        提前 {day} 天
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-end gap-1">
                    <Button
                      onClick={() => openEdit(anniversary)}
                      size="icon"
                      variant="ghost"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      onClick={() => setDeleteConfirm(anniversary)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        title={editing ? "编辑纪念日" : "添加纪念日"}
      >
        <form className="space-y-4 p-5" onSubmit={handleSave}>
          <Input
            label="纪念日名称"
            name="title"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：在一起纪念日"
            required
            value={title}
          />
          <Input
            label="日期"
            name="happenedAt"
            onChange={(e) => setHappenedAt(e.target.value)}
            required
            type="date"
            value={happenedAt}
          />
          <Input
            label="提前提醒天数"
            name="remindDays"
            onChange={(e) => setRemindDaysStr(e.target.value)}
            placeholder="30,7,1"
            value={remindDaysStr}
          />
          <Textarea
            label="备注"
            name="note"
            onChange={(e) => setNote(e.target.value)}
            placeholder="这一天的特别之处..."
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
            确定要删除纪念日「{deleteConfirm?.title}」吗？
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
