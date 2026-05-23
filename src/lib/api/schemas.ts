import { z } from "zod";

export const idSchema = z.string().min(1).max(128);

export const dateSchema = z.coerce.date();

export const optionalDateSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.date().nullable().optional()
);

/** For required-date fields that are optional in update schemas (e.g. happenedAt, checkedAt).
 *  Treats null as "don't update" (undefined) to avoid coercing to Unix epoch. */
export const optionalRequiredDateSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.date().optional()
);

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  cursor: z.string().optional()
});

export const userCreateSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(80),
  password: z
    .string()
    .min(8, "密码至少 8 个字符")
    .max(128)
    .regex(/[a-z]/, "密码需包含小写字母")
    .regex(/[A-Z]/, "密码需包含大写字母")
    .regex(/[0-9]/, "密码需包含数字"),
  avatarUrl: z.string().url().max(1000).optional()
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  avatarUrl: z.string().url().max(1000).nullable().optional()
});

export const authRegisterSchema = userCreateSchema;

export const authLoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128)
});

export const coupleCreateSchema = z.object({
  ownerId: idSchema.optional(),
  title: z.string().min(1).max(80).default("我们的空间"),
  startedAt: optionalDateSchema
});

export const coupleJoinSchema = z.object({
  userId: idSchema.optional(),
  inviteCode: z.string().min(4).max(24)
});

export const coupleUpdateSchema = z.object({
  userId: idSchema.optional(),
  title: z.string().min(1).max(80).optional(),
  startedAt: optionalDateSchema
});

export const anniversaryCreateSchema = z.object({
  userId: idSchema.optional(),
  title: z.string().min(1).max(80),
  happenedAt: dateSchema,
  remindDays: z.array(z.number().int().min(0).max(365)).max(10).default([30, 7, 1]),
  note: z.string().max(1000).optional()
});

export const anniversaryUpdateSchema = z.object({
  userId: idSchema.optional(),
  title: z.string().min(1).max(80).optional(),
  happenedAt: optionalRequiredDateSchema,
  remindDays: z.array(z.number().int().min(0).max(365)).max(10).optional(),
  note: z.string().max(1000).nullable().optional()
});

export const deleteWithUserSchema = z.object({
  userId: idSchema.optional()
});

export const diaryCreateSchema = z.object({
  authorId: idSchema.optional(),
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(20000),
  visibility: z.enum(["PRIVATE", "PARTNER", "SHARED"]).default("SHARED"),
  happenedAt: dateSchema.optional()
});

export const diaryUpdateSchema = z.object({
  userId: idSchema.optional(),
  title: z.string().min(1).max(120).optional(),
  content: z.string().min(1).max(20000).optional(),
  visibility: z.enum(["PRIVATE", "PARTNER", "SHARED"]).optional(),
  happenedAt: optionalRequiredDateSchema
});

export const moodCreateSchema = z.object({
  userId: idSchema.optional(),
  mood: z.string().min(1).max(80),
  energy: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  stressLevel: z.number().int().min(1).max(5).default(3),
  carePreference: z.string().max(300).optional(),
  note: z.string().max(1000).optional(),
  checkedAt: dateSchema.optional()
});

export const moodUpdateSchema = z.object({
  userId: idSchema.optional(),
  mood: z.string().min(1).max(80).optional(),
  energy: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  stressLevel: z.number().int().min(1).max(5).optional(),
  carePreference: z.string().max(300).nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
  checkedAt: optionalRequiredDateSchema
});

export const wishCreateSchema = z.object({
  creatorId: idSchema.optional(),
  title: z.string().min(1).max(120),
  category: z.string().min(1).max(40).default("共同愿望"),
  status: z.enum(["IDEA", "PLANNED", "DONE", "PAUSED"]).default("IDEA"),
  targetAt: optionalDateSchema,
  budgetCents: z.number().int().min(0).max(100_000_000).optional(),
  note: z.string().max(1000).optional()
});

export const wishUpdateSchema = z.object({
  userId: idSchema.optional(),
  title: z.string().min(1).max(120).optional(),
  category: z.string().min(1).max(40).optional(),
  status: z.enum(["IDEA", "PLANNED", "DONE", "PAUSED"]).optional(),
  targetAt: optionalDateSchema,
  budgetCents: z.number().int().min(0).max(100_000_000).nullable().optional(),
  note: z.string().max(1000).nullable().optional()
});

export const photoCreateSchema = z.object({
  uploaderId: idSchema.optional(),
  url: z.string().url().max(1000),
  title: z.string().max(120).optional(),
  event: z.string().max(120).optional(),
  takenAt: optionalDateSchema
});

export const photoUpdateSchema = z.object({
  userId: idSchema.optional(),
  url: z.string().url().max(1000).optional(),
  title: z.string().max(120).nullable().optional(),
  event: z.string().max(120).nullable().optional(),
  takenAt: optionalDateSchema
});

export const timeCapsuleCreateSchema = z.object({
  userId: idSchema.optional(),
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(20000),
  unlockAt: dateSchema
});

export const timeCapsuleUpdateSchema = z.object({
  userId: idSchema.optional(),
  title: z.string().min(1).max(120).optional(),
  content: z.string().min(1).max(20000).optional(),
  unlockAt: optionalRequiredDateSchema
});
