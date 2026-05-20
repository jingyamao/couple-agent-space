"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
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

type Wish = {
  id: string;
  title: string;
  category: string;
  status: "IDEA" | "PLANNED" | "DONE" | "PAUSED";
  targetAt: string | null;
  budgetCents: number | null;
  note: string | null;
  creator: { id: string; name: string };
};

const statusOptions = [
  { label: "灵感", value: "IDEA" },
  { label: "进行中", value: "PLANNED" },
  { label: "已完成", value: "DONE" },
  { label: "暂停", value: "PAUSED" }
];

const statusTones: Record<string, "rose" | "teal" | "gold" | "neutral"> = {
  IDEA: "rose",
  PLANNED: "gold",
  DONE: "teal",
  PAUSED: "neutral"
};

const statusLabels: Record<string, string> = {
  IDEA: "灵感",
  PLANNED: "进行中",
  DONE: "已完成",
  PAUSED: "暂停"
};

const filterOptions = [
  { label: "全部", value: "" },
  ...statusOptions
];

export default function WishesPage() {
  const { couple } = useCouple();
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Wish | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Wish | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("共同愿望");
  const [status, setStatus] = useState("IDEA");
  const [targetAt, setTargetAt] = useState("");
  const [budgetYuan, setBudgetYuan] = useState("");
  const [note, setNote] = useState("");

  const fetchWishes = useCallback(async () => {
    if (!couple) return;
    try {
      const query = filter ? `?status=${filter}` : "";
      const result = await apiClient<Wish[]>(
        `/api/couples/${couple.id}/wishes${query}`
      );
      return result;
    } catch {
      toast("error", "加载愿望失败");
      return [];
    }
  }, [couple, filter, toast]);

  useEffect(() => {
    let cancelled = false;
    fetchWishes().then((result) => {
      if (!cancelled && result) {
        setWishes(result);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [fetchWishes]);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setCategory("共同愿望");
    setStatus("IDEA");
    setTargetAt("");
    setBudgetYuan("");
    setNote("");
    setDialogOpen(true);
  }

  function openEdit(wish: Wish) {
    setEditing(wish);
    setTitle(wish.title);
    setCategory(wish.category);
    setStatus(wish.status);
    setTargetAt(
      wish.targetAt
        ? new Date(wish.targetAt).toISOString().split("T")[0]
        : ""
    );
    setBudgetYuan(
      wish.budgetCents ? (wish.budgetCents / 100).toString() : ""
    );
    setNote(wish.note ?? "");
    setDialogOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!couple) return;
    setIsSaving(true);

    try {
      const body = {
        title,
        category,
        status,
        targetAt: targetAt ? new Date(targetAt).toISOString() : undefined,
        budgetCents: budgetYuan
          ? Math.round(parseFloat(budgetYuan) * 100)
          : undefined,
        note: note || undefined
      };

      if (editing) {
        await apiClient(`/api/couples/${couple.id}/wishes/${editing.id}`, {
          method: "PATCH",
          body
        });
        toast("success", "愿望已更新");
      } else {
        await apiClient(`/api/couples/${couple.id}/wishes`, {
          method: "POST",
          body
        });
        toast("success", "愿望已添加");
      }
      setDialogOpen(false);
      fetchWishes();
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
        `/api/couples/${couple.id}/wishes/${deleteConfirm.id}`,
        { method: "DELETE" }
      );
      toast("success", "愿望已删除");
      setDeleteConfirm(null);
      fetchWishes();
    } catch {
      toast("error", "删除失败");
    }
  }

  async function handleStatusChange(wish: Wish, newStatus: string) {
    if (!couple) return;
    try {
      await apiClient(`/api/couples/${couple.id}/wishes/${wish.id}`, {
        method: "PATCH",
        body: { status: newStatus }
      });
      toast("success", "状态已更新");
      fetchWishes();
    } catch {
      toast("error", "更新失败");
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">愿望清单</h1>
        <div className="flex items-center gap-2">
          <Select
            name="filter"
            onChange={(e) => setFilter(e.target.value)}
            options={filterOptions}
            value={filter}
          />
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            添加愿望
          </Button>
        </div>
      </div>

      {wishes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Star className="mx-auto size-12 text-[var(--muted-foreground)]" />
            <p className="mt-4 text-[var(--muted-foreground)]">
              {filter ? "没有该状态的愿望" : "还没有愿望，许一个吧"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishes.map((wish) => (
            <Card key={wish.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{wish.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {wish.category}
                    </p>
                  </div>
                  <Badge tone={statusTones[wish.status]}>
                    {statusLabels[wish.status]}
                  </Badge>
                </div>

                {wish.budgetCents ? (
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    预算: ¥{(wish.budgetCents / 100).toFixed(0)}
                  </p>
                ) : null}

                {wish.targetAt ? (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    目标: {format(new Date(wish.targetAt), "yyyy-MM-dd")}
                  </p>
                ) : null}

                {wish.note ? (
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {wish.note}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {(["IDEA", "PLANNED", "DONE", "PAUSED"] as const).map(
                    (s) => (
                      <button
                        className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                          wish.status === s
                            ? "bg-[var(--primary)] text-white"
                            : "bg-[#f7f3ed] text-[var(--muted-foreground)] hover:bg-[#e7dfd5]"
                        }`}
                        key={s}
                        onClick={() => handleStatusChange(wish, s)}
                        type="button"
                      >
                        {statusLabels[s]}
                      </button>
                    )
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {wish.creator.name}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => openEdit(wish)}
                      size="icon"
                      variant="ghost"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    {wish.creator.id === user?.id ? (
                      <Button
                        onClick={() => setDeleteConfirm(wish)}
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    ) : null}
                  </div>
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
        title={editing ? "编辑愿望" : "添加愿望"}
      >
        <form className="space-y-4 p-5" onSubmit={handleSave}>
          <Input
            label="愿望名称"
            name="title"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：一起去看海"
            required
            value={title}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="分类"
              name="category"
              onChange={(e) => setCategory(e.target.value)}
              placeholder="共同愿望"
              value={category}
            />
            <Select
              label="状态"
              name="status"
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
              value={status}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="目标日期"
              name="targetAt"
              onChange={(e) => setTargetAt(e.target.value)}
              type="date"
              value={targetAt}
            />
            <Input
              label="预算 (元)"
              name="budgetYuan"
              onChange={(e) => setBudgetYuan(e.target.value)}
              placeholder="0"
              type="number"
              value={budgetYuan}
            />
          </div>
          <Textarea
            label="备注"
            name="note"
            onChange={(e) => setNote(e.target.value)}
            placeholder="关于这个愿望..."
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
            确定要删除愿望「{deleteConfirm?.title}」吗？
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
