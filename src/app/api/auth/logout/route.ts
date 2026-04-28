import { handleApiError, ok } from "@/lib/api/http";
import {
  buildExpiredSessionCookie,
  deleteSessionFromRequest
} from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    await deleteSessionFromRequest(request);

    return ok(
      { ok: true },
      {
        headers: {
          "Set-Cookie": buildExpiredSessionCookie()
        }
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
