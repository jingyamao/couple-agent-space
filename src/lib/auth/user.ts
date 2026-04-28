import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { ApiError } from "@/lib/api/http";

export async function registerUser(input: {
  email: string;
  name: string;
  password: string;
  avatarUrl?: string;
}) {
  const normalizedEmail = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existing) {
    throw new ApiError(409, "EMAIL_ALREADY_REGISTERED", "该邮箱已注册");
  }

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      name: input.name,
      avatarUrl: input.avatarUrl,
      passwordHash: await hashPassword(input.password)
    }
  });
}

export async function authenticateUser(email: string, password: string) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    omit: {
      passwordHash: false
    }
  });

  if (!userWithPassword) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "邮箱或密码错误");
  }

  const isValid = await verifyPassword(password, userWithPassword.passwordHash);

  if (!isValid) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "邮箱或密码错误");
  }

  const { passwordHash, ...user } = userWithPassword;

  void passwordHash;

  return user;
}
