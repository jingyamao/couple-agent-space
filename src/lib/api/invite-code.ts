import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function createUniqueInviteCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomBytes(4).toString("hex").toUpperCase();
    const existing = await prisma.couple.findUnique({
      where: { inviteCode: code },
      select: { id: true }
    });

    if (!existing) {
      return code;
    }
  }

  return `${Date.now().toString(36).toUpperCase()}${randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;
}
