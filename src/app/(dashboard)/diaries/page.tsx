"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { BookHeart, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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

type Diary = {
  id: string;
  title: string;
  content: string;
  visibility: "PRIVATE" | "PARTNER" | "SHARED";
  happenedAt: string;
  author: { id: string; name: string };
};

const visibilityOptions = [
  { label: "公开", value: "SHARED" },
  { label: "对方可见", value: "PARTNER" },
  { label: "仅自己", value: "PRIVATE" }
];

const visibilityLabels: Record<string, string> = {
  SHARED: "公开",
  PARTNER: "对方可见",
  PRIVATE: "仅自己"
};

const visibilityTones: Record<string, "teal" | "gold" | "neutral"> = {
  SHARED: "teal",
  PARTNER: "gold",
  PRIVATE: "neutral"
};

export default function DiariesPage() {
  const { couple } = useCouple();
  const { user } = useAuth();
  const { toast } = useToast();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiary, setEditingDiary] = useState<Diary | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Diary | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("SHARED");
  const [happenedAt, setHappenedAt] = useState(
    new Date().toISOString().split("T")[0]
  );

  const fetchDiaries = useCallback(async () => {
    if (!couple) return;
    try {
      const result = await apiClient<Diary[]>(
        `/api/couples/${couple.id}/diaries`
      );
      return result;
    } catch {
      toast("error", "加载日记失败");
      return [];
    }
  }, [couple, toast]);

  useEffect(() => {
    let cancelled = false;
    fetchDiaries().then((result) => {
      if (!cancelled && result) {
        setDiaries(result);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [fetchDiaries]);

  function openCreate() {
    setEditingDiary(null);
    setTitle("");
    setContent("");
    setVisibility("SHARED");
    setHappenedAt(new Date().toISOString().split("T")[0]);
    setDialogOpen(true);
  }

  function openEdit(diary: Diary) {
    setEditingDiary(diary);
    setTitle(diary.title);
    setContent(diary.content);
    setVisibility(diary.visibility);
    setHappenedAt(new Date(diary.happenedAt).toISOString().split("T")[0]);
    setDialogOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!couple) return;
    setIsSaving(true);

    try {
      if (editingDiary) {
        await apiClient(`/api/couples/${couple.id}/diaries/${editingDiary.id}`, {
          method: "PATCH",
          body: { title, content, visibility, happenedAt: new Date(happenedAt).toISOString() }
        });
        toast("success", "日记已更新");
      } else {
        await apiClient(`/api/couples/${couple.id}/diaries`, {
          method: "POST",
          body: { title, content, visibility, happenedAt: new Date(happenedAt).toISOString() }
        });
        toast("success", "日记已创建");
      }
      setDialogOpen(false);
      fetchDiaries();
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
      await apiClient(`/api/couples/${couple.id}/diaries/${deleteConfirm.id}`, {
        method: "DELETE"
      });
      toast("success", "日记已删除");
      setDeleteConfirm(null);
      fetchDiaries();
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
        <h1 className="text-2xl font-semibold">情侣日记</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          写日记
        </Button>
      </div>

      {diaries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookHeart className="mx-auto size-12 text-[var(--muted-foreground)]" />
            <p className="mt-4 text-[var(--muted-foreground)]">
              还没有日记，写一篇吧
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diaries.map((diary) => (
            <Card key={diary.id} className="flex flex-col">
              <CardContent className="flex-1 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{diary.title}</h3>
                  <Badge tone={visibilityTones[diary.visibility]}>
                    {visibilityLabels[diary.visibility]}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-[var(--muted-foreground)]">
                  {diary.content}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {diary.author.name} ·{" "}
                    {format(new Date(diary.happenedAt), "yyyy-MM-dd")}
                  </span>
                  {diary.author.id === user?.id ? (
                    <div className="flex gap-1">
                      <Button
                        onClick={() => openEdit(diary)}
                        size="icon"
                        variant="ghost"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        onClick={() => setDeleteConfirm(diary)}
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
        title={editingDiary ? "编辑日记" : "写日记"}
      >
        <form className="space-y-4 p-5" onSubmit={handleSave}>
          <Input
            label="标题"
            name="title"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="日记标题"
            required
            value={title}
          />
          <Textarea
            label="内容"
            name="content"
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你们的故事..."
            required
            value={content}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="可见范围"
              name="visibility"
              onChange={(e) => setVisibility(e.target.value)}
              options={visibilityOptions}
              value={visibility}
            />
            <Input
              label="日期"
              name="happenedAt"
              onChange={(e) => setHappenedAt(e.target.value)}
              type="date"
              value={happenedAt}
            />
          </div>
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
            确定要删除日记「{deleteConfirm?.title}」吗？此操作不可撤销。
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={() => setDeleteConfirm(null)}
              variant="outline"
            >
              取消
            </Button>
            <Button onClick={handleDelete} variant="primary">
              删除
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
