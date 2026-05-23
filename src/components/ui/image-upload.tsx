"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "./button";

type ImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  prefix?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
};

export function ImageUpload({ value, onChange, prefix = "uploads", className = "", aspectRatio = "auto" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", prefix);

      const result = await apiClient<{ url: string; key: string }>("/api/upload", {
        method: "POST",
        body: formData
      });

      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setIsUploading(false);
    }
  }, [onChange, prefix]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleUpload(file);
  }, [handleUpload]);

  const aspectClass = aspectRatio === "square" ? "aspect-square" : aspectRatio === "video" ? "aspect-video" : "";

  if (value) {
    return (
      <div className={`group relative overflow-hidden rounded-2xl ${aspectClass} ${className}`}>
        <img alt="" className="h-full w-full object-cover" src={value} />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Button onClick={() => onChange("")} size="icon" variant="ghost">
            <X className="size-5 text-white" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] transition-all hover:border-[var(--primary)] hover:bg-[var(--surface-strong)] ${aspectClass} min-h-[120px]`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" />
        ) : (
          <>
            <ImagePlus className="size-8 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">点击或拖拽上传图片</p>
            <p className="text-xs text-[var(--muted-foreground)]">支持 JPG、PNG、WebP，最大 10MB</p>
          </>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>}
      <input
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}
