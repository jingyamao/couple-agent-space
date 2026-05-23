import { handleApiError, ok } from "@/lib/api/http";
import { getAuthenticatedUser } from "@/lib/api/guards";
import { signUserAvatar } from "@/lib/services/url-signer";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    return ok(signUserAvatar(user));
  } catch (error) {
    return handleApiError(error);
  }
}
