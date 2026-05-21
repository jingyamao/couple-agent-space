"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
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

type Mood = { id: string; userId: string; mood: string; energy: "LOW" | "MEDIUM" | "HIGH"; stressLevel: number; carePreference: string | null; note: string | null; checkedAt: string; user: { id: string; name: string } };
const energyOpts = [{ label: "需要休息", value: "LOW" }, { label: "状态平稳", value: "MEDIUM" }, { label: "精力充沛", value: "HIGH" }];
const energyTones: Record<string, "rose" | "gold" | "teal"> = { LOW: "rose", MEDIUM: "gold", HIGH: "teal" };

export default function MoodsPage() {
  const { couple } = useCouple(); const { user } = useAuth(); const { toast } = useToast();
  const [moods, setMoods] = useState<Mood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Mood | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Mood | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [moodText, setMoodText] = useState(""); const [energy, setEnergy] = useState("MEDIUM");
  const [stressLevel, setStressLevel] = useState(3); const [carePreference, setCarePreference] = useState(""); const [note, setNote] = useState("");

  const fetchData = useCallback(async () => {
    if (!couple) return;
    try { return await apiClient<Mood[]>(`/api/couples/${couple.id}/moods`); }
    catch { toast("error", "加载失败"); return []; }
  }, [couple, toast]);

  useEffect(() => { let c = false; fetchData().then((r) => { if (!c && r) { setMoods(r); setIsLoading(false); } }); return () => { c = true; }; }, [fetchData]);

  function openCreate() { setEditing(null); setMoodText(""); setEnergy("MEDIUM"); setStressLevel(3); setCarePreference(""); setNote(""); setDialogOpen(true); }
  function openEdit(m: Mood) { setEditing(m); setMoodText(m.mood); setEnergy(m.energy); setStressLevel(m.stressLevel); setCarePreference(m.carePreference ?? ""); setNote(m.note ?? ""); setDialogOpen(true); }

  async function handleSave(e: FormEvent) {
    e.preventDefault(); if (!couple) return; setIsSaving(true);
    try {
      const body = { mood: moodText, energy, stressLevel, carePreference: carePreference || undefined, note: note || undefined };
      if (editing) { await apiClient(`/api/couples/${couple.id}/moods/${editing.id}`, { method: "PATCH", body }); toast("success", "已更新"); }
      else { await apiClient(`/api/couples/${couple.id}/moods`, { method: "POST", body }); toast("success", "已记录"); }
      setDialogOpen(false); fetchData().then((r) => { if (r) setMoods(r); });
    } catch (err) { toast("error", err instanceof ApiClientError ? err.message : "操作失败"); }
    finally { setIsSaving(false); }
  }

  async function handleDelete() {
    if (!couple || !deleteConfirm) return;
    try { await apiClient(`/api/couples/${couple.id}/moods/${deleteConfirm.id}`, { method: "DELETE" }); toast("success", "已删除"); setDeleteConfirm(null); fetchData().then((r) => { if (r) setMoods(r); }); }
    catch { toast("error", "删除失败"); }
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>心情打卡</h1>
        <Button onClick={openCreate}><Plus className="size-4" /> 记录心情</Button>
      </div>

      {moods.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><Sparkles className="mx-auto size-12 text-[var(--muted-foreground)]" /><p className="mt-4 text-[var(--muted-foreground)]">还没有心情记录</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moods.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div><p className="font-semibold">{m.user.name}</p><p className="mt-1 text-lg" style={{ fontFamily: "var(--font-serif)" }}>{m.mood}</p></div>
                    <Badge tone={energyTones[m.energy]}>{energyOpts.find((e) => e.value === m.energy)?.label}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-[var(--muted-foreground)]">压力:</span>
                    <div className="flex gap-1">{[1,2,3,4,5].map((l) => <div className={`size-2 rounded-full transition-colors ${l <= m.stressLevel ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} key={l} />)}</div>
                  </div>
                  {m.carePreference && <p className="mt-3 rounded-xl bg-[var(--surface)] p-3 text-sm">{m.carePreference}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-[var(--muted-foreground)]">{format(new Date(m.checkedAt), "MM-dd HH:mm")}</span>
                    {m.userId === user?.id && (
                      <div className="flex gap-1">
                        <Button onClick={() => openEdit(m)} size="icon" variant="ghost"><Pencil className="size-3.5" /></Button>
                        <Button onClick={() => setDeleteConfirm(m)} size="icon" variant="ghost"><Trash2 className="size-3.5" /></Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog onClose={() => setDialogOpen(false)} open={dialogOpen} title={editing ? "编辑心情" : "记录心情"}>
        <form className="space-y-4 p-5" onSubmit={handleSave}>
          <Input label="今天的心情" name="mood" onChange={(e) => setMoodText(e.target.value)} placeholder="开心、平静、有点累..." required value={moodText} />
          <Select label="精力状态" name="energy" onChange={(e) => setEnergy(e.target.value)} options={energyOpts} value={energy} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--muted-foreground)]">压力等级: {stressLevel}</label>
            <input className="w-full accent-[var(--primary)]" max={5} min={1} onChange={(e) => setStressLevel(Number(e.target.value))} type="range" value={stressLevel} />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)]"><span>轻松</span><span>很大</span></div>
          </div>
          <Textarea label="希望对方怎样关心你" name="care" onChange={(e) => setCarePreference(e.target.value)} value={carePreference} />
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">取消</Button>
            <Button disabled={isSaving} type="submit">{isSaving ? <Loader2 className="size-4 animate-spin" /> : "保存"}</Button>
          </div>
        </form>
      </Dialog>

      <Dialog onClose={() => setDeleteConfirm(null)} open={!!deleteConfirm} title="确认删除">
        <div className="p-5">
          <p className="text-sm text-[var(--muted-foreground)]">确定要删除这条心情记录吗？</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setDeleteConfirm(null)} variant="outline">取消</Button>
            <Button onClick={handleDelete} variant="danger">删除</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
