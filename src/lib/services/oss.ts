import crypto from "crypto";

const REGION = process.env.OSS_REGION ?? "";
const ACCESS_KEY_ID = process.env.OSS_ACCESS_KEY_ID ?? "";
const ACCESS_KEY_SECRET = process.env.OSS_ACCESS_KEY_SECRET ?? "";
const BUCKET = process.env.OSS_BUCKET ?? "";

export function getOssConfig() {
  return {
    region: REGION,
    bucket: BUCKET,
    endpoint: `https://${BUCKET}.${REGION}.aliyuncs.com`,
    publicUrl: `https://${BUCKET}.${REGION}.aliyuncs.com`
  };
}

export function isOssConfigured(): boolean {
  return !!(REGION && ACCESS_KEY_ID && ACCESS_KEY_SECRET && BUCKET);
}

function signRequest(method: string, contentType: string, date: string, ossHeaders: string, resource: string) {
  const stringToSign = `${method}\n\n${contentType}\n${date}\n${ossHeaders}${resource}`;
  const signature = crypto
    .createHmac("sha1", ACCESS_KEY_SECRET)
    .update(stringToSign)
    .digest("base64");
  return `OSS ${ACCESS_KEY_ID}:${signature}`;
}

export async function uploadToOss(
  key: string,
  data: Buffer,
  contentType: string
): Promise<{ url: string; key: string }> {
  if (!isOssConfigured()) {
    throw new Error("OSS not configured");
  }

  const date = new Date().toUTCString();
  const resource = `/${BUCKET}/${key}`;
  const authorization = signRequest("PUT", contentType, date, "", resource);
  const endpoint = `https://${BUCKET}.${REGION}.aliyuncs.com`;

  const response = await fetch(`${endpoint}/${key}`, {
    method: "PUT",
    headers: {
      Authorization: authorization,
      Date: date,
      "Content-Type": contentType
    },
    body: new Uint8Array(data)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OSS upload failed: ${response.status} ${text}`);
  }

  return {
    url: `${endpoint}/${key}`,
    key
  };
}

export function generateOssKey(prefix: string, filename: string): string {
  const ext = filename.split(".").pop() ?? "jpg";
  const hash = crypto.randomBytes(8).toString("hex");
  const date = new Date().toISOString().split("T")[0];
  return `${prefix}/${date}/${hash}.${ext}`;
}

export function generateSignedUrl(key: string, expiresIn = 3600): string {
  if (!isOssConfigured()) return "";

  const epoch = Math.floor(Date.now() / 1000) + expiresIn;
  const resource = `/${BUCKET}/${key}`;
  const stringToSign = `GET\n\n\n${epoch}\n${resource}`;
  const signature = crypto
    .createHmac("sha1", ACCESS_KEY_SECRET)
    .update(stringToSign)
    .digest("base64");

  return `https://${BUCKET}.${REGION}.aliyuncs.com/${key}?OSSAccessKeyId=${ACCESS_KEY_ID}&Expires=${epoch}&Signature=${encodeURIComponent(signature)}`;
}

export function signOssUrl(url: string, expiresIn = 3600): string {
  if (!url || !isOssConfigured()) return url;

  const prefix = `https://${BUCKET}.${REGION}.aliyuncs.com/`;
  if (!url.startsWith(prefix)) return url;

  const key = url.slice(prefix.length);
  return generateSignedUrl(key, expiresIn);
}
