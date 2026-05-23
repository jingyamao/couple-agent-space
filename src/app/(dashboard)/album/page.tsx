"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Camera, Loader2, Plus, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCouple } from "@/hooks/use-couple";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";

type Photo = {
  id: string;
  url: string;
  title: string | null;
  event: string | null;
  takenAt: string | null;
  uploaderId: string;
};

export default function AlbumPage() {
  const { couple } = useCouple();
  const { user } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Photo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [event, setEvent] = useState("");
  const [takenAt, setTakenAt] = useState("");

  const fetchPhotos = useCallback(async () => {
    if (!couple) return;
    try { return await apiClient<Photo[]>(`/api/couples/${couple.id}/photos`); }
    catch { toast("error", "加载失败"); return []; }
  }, [couple, toast]);

  useEffect(() => {
    let c = false;
    fetchPhotos().then((r) => { if (!c && r) { setPhotos(r); setIsLoading(false); } });
    return () => { c = true; };
  }, [fetchPhotos]);

  function openCreate() {
    setImageUrl(""); setTitle(""); setEvent(""); setTakenAt("");
    setDialogOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!couple || !imageUrl) return;
    setIsSaving(true);
    try {
      await apiClient(`/api/couples/${couple.id}/photos`, {
        method: "POST",
        body: {
          url: imageUrl,
          title: title || undefined,
          event: event || undefined,
          takenAt: takenAt ? new Date(takenAt).toISOString() : undefined
        }
      });
      toast("success", "照片已添加");
      setDialogOpen(false);
      fetchPhotos().then((r) => { if (r) setPhotos(r); });
    } catch (err) {
      toast("error", err instanceof ApiClientError ? err.message : "上传失败");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!couple || !deleteConfirm) return;
    try {
      await apiClient(`/api/couples/${couple.id}/photos/${deleteConfirm.id}`, { method: "DELETE" });
      toast("success", "已删除");
      setDeleteConfirm(null);
      fetchPhotos().then((r) => { if (r) setPhotos(r); });
    } catch {
      toast("error", "删除失败");
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>情侣相册</h1>
        <Button onClick={openCreate}><Plus className="size-4" /> 上传照片</Button>
      </div>

      {photos.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Camera className="mx-auto size-12 text-[var(--muted-foreground)]" />
            <p className="mt-4 text-[var(--muted-foreground)]">还没有照片，上传第一张吧</p>
          </CardContent>
        </Card>
      ) : (
        <div className="columns-2 gap-4 space-y-4 sm:columns-3 lg:columns-4">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              className="break-inside-avoid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <div
                className="group relative cursor-pointer overflow-hidden rounded-2xl"
                onClick={() => setLightbox(photo)}
              >
                <img
                  alt={photo.title ?? ""}
                  className="w-full transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  src={photo.url}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    {photo.title && <p className="text-sm font-medium text-white">{photo.title}</p>}
                    {photo.event && <p className="text-xs text-white/80">{photo.event}</p>}
                  </div>
                </div>
                {photo.uploaderId === user?.id && (
                  <button
                    className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    data-no-heart
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(photo); }}
                    type="button"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog onClose={() => setDialogOpen(false)} open={dialogOpen} title="上传照片">
        <form className="space-y-4 p-5" onSubmit={handleSave}>
          <ImageUpload onChange={setImageUrl} prefix="album" value={imageUrl} />
          <Input label="标题" name="title" onChange={(e) => setTitle(e.target.value)} placeholder="给照片起个名字" value={title} />
          <Input label="事件" name="event" onChange={(e) => setEvent(e.target.value)} placeholder="关联事件（可选）" value={event} />
          <Input label="拍摄日期" name="takenAt" onChange={(e) => setTakenAt(e.target.value)} type="date" value={takenAt} />
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">取消</Button>
            <Button disabled={isSaving || !imageUrl} type="submit">
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : "添加"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              animate={{ scale: 1 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              exit={{ scale: 0.9 }}
              initial={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img alt="" className="max-h-[85vh] rounded-2xl object-contain" src={lightbox.url} />
              <button
                className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-white shadow-lg"
                onClick={() => setLightbox(null)}
                type="button"
              >
                <X className="size-4" />
              </button>
              {(lightbox.title || lightbox.event) && (
                <div className="mt-3 text-center text-white">
                  {lightbox.title && <p className="font-medium">{lightbox.title}</p>}
                  {lightbox.event && <p className="text-sm text-white/80">{lightbox.event}</p>}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <Dialog onClose={() => setDeleteConfirm(null)} open={!!deleteConfirm} title="确认删除">
        <div className="p-5">
          <p className="text-sm text-[var(--muted-foreground)]">确定要删除这张照片吗？</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setDeleteConfirm(null)} variant="outline">取消</Button>
            <Button onClick={handleDelete} variant="danger">删除</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
