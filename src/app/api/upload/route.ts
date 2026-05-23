import { NextRequest } from "next/server";
import { ApiError, handleApiError, ok } from "@/lib/api/http";
import { getAuthenticatedUser } from "@/lib/api/guards";
import { uploadToOss, generateOssKey, getOssConfig, isOssConfigured, generateSignedUrl } from "@/lib/services/oss";

export async function POST(request: NextRequest) {
  try {
    await getAuthenticatedUser(request);

    if (!isOssConfigured()) {
      throw new ApiError(503, "OSS_NOT_CONFIGURED", "图片上传服务未配置");
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const prefix = (formData.get("prefix") as string) ?? "uploads";

    if (!file) {
      throw new ApiError(400, "NO_FILE", "请选择要上传的文件");
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new ApiError(400, "FILE_TOO_LARGE", "文件大小不能超过 10MB");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new ApiError(400, "INVALID_TYPE", "只支持 JPG、PNG、GIF、WebP 格式");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = generateOssKey(prefix, file.name);
    const result = await uploadToOss(key, buffer, file.type);
    const signedUrl = generateSignedUrl(key, 86400 * 365);

    return ok({
      url: signedUrl || result.url,
      key: result.key,
      config: getOssConfig()
    });
  } catch (error) {
    return handleApiError(error);
  }
}
