type ApiClientOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly detail?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiClient<T>(
  path: string,
  options?: ApiClientOptions
): Promise<T> {
  const { method = "GET", body, headers: extraHeaders } = options ?? {};

  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = { ...extraHeaders };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(path, {
    method,
    credentials: "include",
    headers,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorPayload = payload?.error;
    throw new ApiClientError(
      response.status,
      errorPayload?.code ?? "UNKNOWN_ERROR",
      errorPayload?.message ?? "请求失败",
      errorPayload?.detail
    );
  }

  return (payload as { data: T }).data;
}
