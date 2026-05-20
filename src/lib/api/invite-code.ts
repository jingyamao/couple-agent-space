import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const INVITE_CODE_TTL_DAYS = 7;

export async function createUniqueInviteCode(): Promise<{
  code: string;
  expiresAt: Date;
}> {
  let code: string | null = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = randomBytes(4).toString("hex").toUpperCase();
    const existing = await prisma.couple.findUnique({
      where: { inviteCode: candidate },
      select: { id: true }
    });

    if (!existing) {
      code = candidate;
      break;
    }
  }

  if (!code) {
    code = `${Date.now().toString(36).toUpperCase()}${randomBytes(2)
      .toString("hex")
      .toUpperCase()}`;
  }

  return {
    code,
    expiresAt: new Date(Date.now() + INVITE_CODE_TTL_DAYS * 86_400_000)
  };
}
