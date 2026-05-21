"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
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

type Wish = { id: string; title: string; category: string; status: "IDEA" | "PLANNED" | "DONE" | "PAUSED"; targetAt: string | null; budgetCents: number | null; note: string | null; creator: { id: string; name: string } };
const statusOpts = [{ label: "灵感", value: "IDEA" }, { label: "进行中", value: "PLANNED" }, { label: "已完成", value: "DONE" }, { label: "暂停", value: "PAUSED" }];
const statusTones: Record<string, "rose" | "teal" | "gold" | "neutral"> = { IDEA: "rose", PLANNED: "gold", DONE: "teal", PAUSED: "neutral" };
const statusLabels: Record<string, string> = { IDEA: "灵感", PLANNED: "进行中", DONE: "已完成", PAUSED: "暂停" };
const filterOpts = [{ label: "全部", value: "" }, ...statusOpts];

export default function WishesPage() {
  const { couple } = useCouple(); const { user } = useAuth(); const { toast } = useToast();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Wish | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Wish | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(""); const [category, setCategory] = useState("共同愿望");
  const [status, setStatus] = useState("IDEA"); const [targetAt, setTargetAt] = useState("");
  const [budgetYuan, setBudgetYuan] = useState(""); const [note, setNote] = useState("");

  const fetchData = useCallback(async () => {
    if (!couple) return;
    try { const q = filter ? `?status=${filter}` : ""; return await apiClient<Wish[]>(`/api/couples/${couple.id}/wishes${q}`); }
    catch { toast("error", "加载失败"); return []; }
  }, [couple, filter, toast]);

  useEffect(() => { let c = false; fetchData().then((r) => { if (!c && r) { setWishes(r); setIsLoading(false); } }); return () => { c = true; }; }, [fetchData]);

  function openCreate() { setEditing(null); setTitle(""); setCategory("共同愿望"); setStatus("IDEA"); setTargetAt(""); setBudgetYuan(""); setNote(""); setDialogOpen(true); }
  function openEdit(w: Wish) { setEditing(w); setTitle(w.title); setCategory(w.category); setStatus(w.status); setTargetAt(w.targetAt ? new Date(w.targetAt).toISOString().split("T")[0] : ""); setBudgetYuan(w.budgetCents ? (w.budgetCents / 100).toString() : ""); setNote(w.note ?? ""); setDialogOpen(true); }

  async function handleSave(e: FormEvent) {
    e.preventDefault(); if (!couple) return; setIsSaving(true);
    try {
      const body = { title, category, status, targetAt: targetAt ? new Date(targetAt).toISOString() : undefined, budgetCents: budgetYuan ? Math.round(parseFloat(budgetYuan) * 100) : undefined, note: note || undefined };
      if (editing) { await apiClient(`/api/couples/${couple.id}/wishes/${editing.id}`, { method: "PATCH", body }); toast("success", "已更新"); }
      else { await apiClient(`/api/couples/${couple.id}/wishes`, { method: "POST", body }); toast("success", "已添加"); }
      setDialogOpen(false); fetchData().then((r) => { if (r) setWishes(r); });
    } catch (err) { toast("error", err instanceof ApiClientError ? err.message : "操作失败"); }
    finally { setIsSaving(false); }
  }

  async function handleDelete() {
    if (!couple || !deleteConfirm) return;
    try { await apiClient(`/api/couples/${couple.id}/wishes/${deleteConfirm.id}`, { method: "DELETE" }); toast("success", "已删除"); setDeleteConfirm(null); fetchData().then((r) => { if (r) setWishes(r); }); }
    catch { toast("error", "删除失败"); }
  }

  async function handleStatusChange(w: Wish, s: string) {
    if (!couple) return;
    try { await apiClient(`/api/couples/${couple.id}/wishes/${w.id}`, { method: "PATCH", body: { status: s } }); toast("success", "已更新"); fetchData().then((r) => { if (r) setWishes(r); }); }
    catch { toast("error", "更新失败"); }
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>愿望清单</h1>
        <div className="flex items-center gap-2">
          <Select name="filter" onChange={(e) => setFilter(e.target.value)} options={filterOpts} value={filter} />
          <Button onClick={openCreate}><Plus className="size-4" /> 添加愿望</Button>
        </div>
      </div>

      {wishes.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><Star className="mx-auto size-12 text-[var(--muted-foreground)]" /><p className="mt-4 text-[var(--muted-foreground)]">{filter ? "没有该状态的愿望" : "还没有愿望"}</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishes.map((w, i) => (
            <motion.div className="flex" key={w.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
              <Card className="flex flex-1 flex-col">
                <CardContent className="flex flex-1 flex-col justify-between p-5">
                  <div className="flex items-start justify-between">
                    <div><h3 className="font-semibold" style={{ fontFamily: "var(--font-serif)" }}>{w.title}</h3><p className="text-xs text-[var(--muted-foreground)]">{w.category}</p></div>
                    <Badge tone={statusTones[w.status]}>{statusLabels[w.status]}</Badge>
                  </div>
                  {w.budgetCents && <p className="mt-2 text-sm text-[var(--muted-foreground)]">预算: ¥{(w.budgetCents / 100).toFixed(0)}</p>}
                  {w.targetAt && <p className="text-sm text-[var(--muted-foreground)]">目标: {format(new Date(w.targetAt), "yyyy-MM-dd")}</p>}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(["IDEA","PLANNED","DONE","PAUSED"] as const).map((s) => (
                      <button className={`rounded-lg px-2 py-1 text-xs font-medium transition-all duration-200 ${w.status === s ? "bg-[var(--primary)] text-white shadow-sm" : "bg-[var(--surface)] text-[var(--muted-foreground)] hover:bg-[var(--surface-strong)]"}`} key={s} onClick={() => handleStatusChange(w, s)} type="button">{statusLabels[s]}</button>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-[var(--muted-foreground)]">{w.creator.name}</span>
                    <div className="flex gap-1">
                      <Button onClick={() => openEdit(w)} size="icon" variant="ghost"><Pencil className="size-3.5" /></Button>
                      {w.creator.id === user?.id && <Button onClick={() => setDeleteConfirm(w)} size="icon" variant="ghost"><Trash2 className="size-3.5" /></Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog onClose={() => setDialogOpen(false)} open={dialogOpen} title={editing ? "编辑愿望" : "添加愿望"}>
        <form className="space-y-4 p-5" onSubmit={handleSave}>
          <Input label="愿望名称" name="title" onChange={(e) => setTitle(e.target.value)} placeholder="一起去看海" required value={title} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="分类" name="category" onChange={(e) => setCategory(e.target.value)} value={category} />
            <Select label="状态" name="status" onChange={(e) => setStatus(e.target.value)} options={statusOpts} value={status} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="目标日期" name="targetAt" onChange={(e) => setTargetAt(e.target.value)} type="date" value={targetAt} />
            <Input label="预算 (元)" name="budget" onChange={(e) => setBudgetYuan(e.target.value)} type="number" value={budgetYuan} />
          </div>
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
