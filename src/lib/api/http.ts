import { ZodError, type ZodType } from "zod";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly detail?: unknown
  ) {
    super(message);
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json({ data }, init);
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function noContent() {
  return new Response(null, { status: 204 });
}

export function getSearchParam(request: Request, key: string) {
  return new URL(request.url).searchParams.get(key);
}

export async function parseJson<T>(request: Request, schema: ZodType<T>) {
  const body = await request.json().catch(() => {
    throw new ApiError(400, "INVALID_JSON", "请求体不是合法 JSON");
  });

  return schema.parse(body);
}

export async function parseOptionalJson<T>(
  request: Request,
  schema: ZodType<T>,
  fallback: T
) {
  const text = await request.text();

  if (!text.trim()) {
    return fallback;
  }

  try {
    return schema.parse(JSON.parse(text));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ApiError(400, "INVALID_JSON", "请求体不是合法 JSON");
    }

    throw error;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          detail: error.detail
        }
      },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "请求参数不符合要求",
          detail: error.flatten()
        }
      },
      { status: 400 }
    );
  }

  console.error(error);

  return Response.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "服务暂时不可用"
      }
    },
    { status: 500 }
  );
}
