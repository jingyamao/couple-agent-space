"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";
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
import { ImageUpload } from "@/components/ui/image-upload";

type CheckIn = {
  id: string;
  title: string;
  note: string | null;
  imageUrl: string | null;
  location: string | null;
  longitude: number | null;
  latitude: number | null;
  address: string | null;
  checkedAt: string;
  userId: string;
  user: { id: string; name: string; avatarUrl: string | null };
};

export default function CheckInsPage() {
  const { couple } = useCouple();
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<CheckIn | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);

  const fetchCheckins = useCallback(async () => {
    if (!couple) return;
    try { return await apiClient<CheckIn[]>(`/api/couples/${couple.id}/checkins`); }
    catch { toast("error", "加载失败"); return []; }
  }, [couple, toast]);

  useEffect(() => {
    let c = false;
    fetchCheckins().then((r) => { if (!c && r) { setCheckins(r); setIsLoading(false); } });
    return () => { c = true; };
  }, [fetchCheckins]);

  function openCreate() {
    setTitle(""); setNote(""); setImageUrl("");
    setLocation(""); setAddress(""); setLongitude(null); setLatitude(null);
    setDialogOpen(true);
  }

  async function getCurrentLocation() {
    if (!navigator.geolocation) {
      toast("error", "浏览器不支持定位");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { longitude: lng, latitude: lat } = pos.coords;
        setLongitude(lng);
        setLatitude(lat);
        setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);

        try {
          const data = await apiClient<{ formattedAddress: string }>(
            `/api/weather?lng=${lng}&lat=${lat}`
          );
          if (data.formattedAddress) setAddress(data.formattedAddress);
        } catch { }
        setIsLocating(false);
      },
      () => {
        toast("error", "定位失败，请检查权限");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!couple || !title) return;
    setIsSaving(true);
    try {
      await apiClient(`/api/couples/${couple.id}/checkins`, {
        method: "POST",
        body: {
          title,
          note: note || undefined,
          imageUrl: imageUrl || undefined,
          location: location || undefined,
          longitude: longitude ?? undefined,
          latitude: latitude ?? undefined,
          address: address || undefined
        }
      });
      toast("success", "打卡成功");
      setDialogOpen(false);
      fetchCheckins().then((r) => { if (r) setCheckins(r); });
    } catch (err) {
      toast("error", err instanceof ApiClientError ? err.message : "打卡失败");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!couple || !deleteConfirm) return;
    try {
      await apiClient(`/api/couples/${couple.id}/checkins/${deleteConfirm.id}`, { method: "DELETE" });
      toast("success", "已删除");
      setDeleteConfirm(null);
      fetchCheckins().then((r) => { if (r) setCheckins(r); });
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
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>地图打卡</h1>
        <Button onClick={openCreate}><Plus className="size-4" /> 打卡</Button>
      </div>

      {checkins.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MapPin className="mx-auto size-12 text-[var(--muted-foreground)]" />
            <p className="mt-4 text-[var(--muted-foreground)]">还没有打卡记录</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {checkins.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
              <Card className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {c.imageUrl && (
                    <div className="shrink-0 sm:w-48">
                      <img alt="" className="h-48 w-full object-cover sm:h-full" src={c.imageUrl} />
                    </div>
                  )}
                  <CardContent className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold" style={{ fontFamily: "var(--font-serif)" }}>{c.title}</h3>
                        {c.userId === user?.id && (
                          <Button onClick={() => setDeleteConfirm(c)} size="icon" variant="ghost">
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                      {c.note && <p className="mt-2 text-sm text-[var(--muted-foreground)]">{c.note}</p>}
                      {c.address && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-[var(--primary)]" />
                          <span className="text-sm text-[var(--muted-foreground)]">{c.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] text-center text-[10px] font-bold text-white leading-6">
                          {c.user.name.charAt(0)}
                        </div>
                        <span className="text-xs text-[var(--muted-foreground)]">{c.user.name}</span>
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {format(new Date(c.checkedAt), "yyyy-MM-dd HH:mm")}
                      </span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog onClose={() => setDialogOpen(false)} open={dialogOpen} title="打卡">
        <form className="space-y-4 p-5" onSubmit={handleSave}>
          <Input label="标题" name="title" onChange={(e) => setTitle(e.target.value)} placeholder="记录这个瞬间" required value={title} />
          <Textarea label="备注" name="note" onChange={(e) => setNote(e.target.value)} placeholder="写下你的感受..." value={note} />
          <ImageUpload onChange={setImageUrl} prefix="checkins" value={imageUrl} />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--muted-foreground)]">位置</label>
            <div className="flex gap-2">
              <Button disabled={isLocating} onClick={getCurrentLocation} type="button" variant="outline">
                {isLocating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
                {isLocating ? "定位中..." : "获取当前位置"}
              </Button>
            </div>
            {address && (
              <div className="flex items-center gap-1.5 rounded-xl bg-[var(--surface)] px-3 py-2">
                <MapPin className="size-3.5 text-[var(--primary)]" />
                <span className="text-sm">{address}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">取消</Button>
            <Button disabled={isSaving || !title} type="submit">
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : "打卡"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog onClose={() => setDeleteConfirm(null)} open={!!deleteConfirm} title="确认删除">
        <div className="p-5">
          <p className="text-sm text-[var(--muted-foreground)]">确定要删除这条打卡记录吗？</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setDeleteConfirm(null)} variant="outline">取消</Button>
            <Button onClick={handleDelete} variant="danger">删除</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
