import { handleApiError, ok } from "@/lib/api/http";
import { getAuthenticatedUser } from "@/lib/api/guards";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    return ok(user);
  } catch (error) {
    return handleApiError(error);
  }
}
