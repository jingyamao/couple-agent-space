"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { format, differenceInDays, addYears } from "date-fns";
import { CalendarHeart, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCouple } from "@/hooks/use-couple";
import { useToast } from "@/components/ui/toast";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Anniversary = { id: string; title: string; happenedAt: string; remindDays: number[]; note: string | null };

export default function AnniversariesPage() {
  const { couple } = useCouple(); const { toast } = useToast();
  const [items, setItems] = useState<Anniversary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Anniversary | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Anniversary | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(""); const [happenedAt, setHappenedAt] = useState("");
  const [remindDaysStr, setRemindDaysStr] = useState("30,7,1"); const [note, setNote] = useState("");

  const fetchData = useCallback(async () => {
    if (!couple) return;
    try { return await apiClient<Anniversary[]>(`/api/couples/${couple.id}/anniversaries`); }
    catch { toast("error", "加载失败"); return []; }
  }, [couple, toast]);

  useEffect(() => { let c = false; fetchData().then((r) => { if (!c && r) { setItems(r); setIsLoading(false); } }); return () => { c = true; }; }, [fetchData]);

  function getDaysUntil(d: string) {
    const date = new Date(d); const now = new Date();
    let next = new Date(now.getFullYear(), date.getMonth(), date.getDate());
    if (next.getTime() < now.getTime()) next = addYears(next, 1);
    return differenceInDays(next, new Date());
  }

  function openCreate() { setEditing(null); setTitle(""); setHappenedAt(""); setRemindDaysStr("30,7,1"); setNote(""); setDialogOpen(true); }
  function openEdit(a: Anniversary) { setEditing(a); setTitle(a.title); setHappenedAt(new Date(a.happenedAt).toISOString().split("T")[0]); setRemindDaysStr(a.remindDays.join(",")); setNote(a.note ?? ""); setDialogOpen(true); }

  async function handleSave(e: FormEvent) {
    e.preventDefault(); if (!couple) return; setIsSaving(true);
    try {
      const remindDays = remindDaysStr.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
      const body = { title, happenedAt: new Date(happenedAt).toISOString(), remindDays, note: note || undefined };
      if (editing) { await apiClient(`/api/couples/${couple.id}/anniversaries/${editing.id}`, { method: "PATCH", body }); toast("success", "已更新"); }
      else { await apiClient(`/api/couples/${couple.id}/anniversaries`, { method: "POST", body }); toast("success", "已添加"); }
      setDialogOpen(false); fetchData().then((r) => { if (r) setItems(r); });
    } catch (err) { toast("error", err instanceof ApiClientError ? err.message : "操作失败"); }
    finally { setIsSaving(false); }
  }

  async function handleDelete() {
    if (!couple || !deleteConfirm) return;
    try { await apiClient(`/api/couples/${couple.id}/anniversaries/${deleteConfirm.id}`, { method: "DELETE" }); toast("success", "已删除"); setDeleteConfirm(null); fetchData().then((r) => { if (r) setItems(r); }); }
    catch { toast("error", "删除失败"); }
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>纪念日</h1>
        <Button onClick={openCreate}><Plus className="size-4" /> 添加纪念日</Button>
      </div>

      {items.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><CalendarHeart className="mx-auto size-12 text-[var(--muted-foreground)]" /><p className="mt-4 text-[var(--muted-foreground)]">还没有纪念日</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a, i) => {
            const days = getDaysUntil(a.happenedAt);
            return (
              <motion.div className="flex" key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                <Card className="flex flex-1 flex-col">
                  <CardContent className="flex flex-1 flex-col justify-between p-5">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold" style={{ fontFamily: "var(--font-serif)" }}>{a.title}</h3>
                      <Badge tone={days <= 7 ? "rose" : days <= 30 ? "gold" : "teal"}>{days === 0 ? "就是今天！" : `${days} 天后`}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">{format(new Date(a.happenedAt), "yyyy年MM月dd日")}</p>
                    {a.note && <p className="mt-2 text-sm text-[var(--muted-foreground)]">{a.note}</p>}
                    <div className="mt-3 flex flex-wrap gap-1">{a.remindDays.map((d) => <Badge key={d} tone="neutral">提前 {d} 天</Badge>)}</div>
                    <div className="mt-3 flex justify-end gap-1">
                      <Button onClick={() => openEdit(a)} size="icon" variant="ghost"><Pencil className="size-3.5" /></Button>
                      <Button onClick={() => setDeleteConfirm(a)} size="icon" variant="ghost"><Trash2 className="size-3.5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog onClose={() => setDialogOpen(false)} open={dialogOpen} title={editing ? "编辑纪念日" : "添加纪念日"}>
        <form className="space-y-4 p-5" onSubmit={handleSave}>
          <Input label="名称" name="title" onChange={(e) => setTitle(e.target.value)} placeholder="在一起纪念日" required value={title} />
          <Input label="日期" name="happenedAt" onChange={(e) => setHappenedAt(e.target.value)} required type="date" value={happenedAt} />
          <Input label="提前提醒天数" name="remindDays" onChange={(e) => setRemindDaysStr(e.target.value)} placeholder="30,7,1" value={remindDaysStr} />
          <Textarea label="备注" name="note" onChange={(e) => setNote(e.target.value)} value={note} />
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">取消</Button>
            <Button disabled={isSaving} type="submit">{isSaving ? <Loader2 className="size-4 animate-spin" /> : "保存"}</Button>
          </div>
        </form>
      </Dialog>

      <Dialog onClose={() => setDeleteConfirm(null)} open={!!deleteConfirm} title="确认删除">
        <div className="p-5">
          <p className="text-sm text-[var(--muted-foreground)]">确定要删除「{deleteConfirm?.title}」吗？</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setDeleteConfirm(null)} variant="outline">取消</Button>
            <Button onClick={handleDelete} variant="danger">删除</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
