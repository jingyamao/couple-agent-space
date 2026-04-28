-- CreateEnum
CREATE TYPE "CoupleRole" AS ENUM ('OWNER', 'PARTNER');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PARTNER', 'SHARED');

-- CreateEnum
CREATE TYPE "MoodEnergy" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "WishStatus" AS ENUM ('IDEA', 'PLANNED', 'DONE', 'PAUSED');

-- CreateEnum
CREATE TYPE "TimeCapsuleStatus" AS ENUM ('LOCKED', 'OPENED');

-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('SUCCESS', 'FALLBACK', 'ERROR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Couple" (
    "id" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '我们的空间',
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Couple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoupleMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "role" "CoupleRole" NOT NULL DEFAULT 'PARTNER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoupleMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anniversary" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "happenedAt" TIMESTAMP(3) NOT NULL,
    "remindDays" INTEGER[] DEFAULT ARRAY[30, 7, 1]::INTEGER[],
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anniversary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryEntry" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'SHARED',
    "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodCheckIn" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "energy" "MoodEnergy" NOT NULL DEFAULT 'MEDIUM',
    "stressLevel" INTEGER NOT NULL DEFAULT 3,
    "carePreference" TEXT,
    "note" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wish" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "WishStatus" NOT NULL DEFAULT 'IDEA',
    "targetAt" TIMESTAMP(3),
    "budgetCents" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "event" TEXT,
    "takenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeCapsule" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "unlockAt" TIMESTAMP(3) NOT NULL,
    "status" "TimeCapsuleStatus" NOT NULL DEFAULT 'LOCKED',
    "openedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeCapsule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentMemory" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT,
    "userId" TEXT,
    "intent" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "status" "AgentRunStatus" NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Couple_inviteCode_key" ON "Couple"("inviteCode");

-- CreateIndex
CREATE INDEX "CoupleMember_coupleId_idx" ON "CoupleMember"("coupleId");

-- CreateIndex
CREATE UNIQUE INDEX "CoupleMember_userId_coupleId_key" ON "CoupleMember"("userId", "coupleId");

-- CreateIndex
CREATE INDEX "Anniversary_coupleId_happenedAt_idx" ON "Anniversary"("coupleId", "happenedAt");

-- CreateIndex
CREATE INDEX "DiaryEntry_coupleId_happenedAt_idx" ON "DiaryEntry"("coupleId", "happenedAt");

-- CreateIndex
CREATE INDEX "DiaryEntry_authorId_idx" ON "DiaryEntry"("authorId");

-- CreateIndex
CREATE INDEX "MoodCheckIn_coupleId_checkedAt_idx" ON "MoodCheckIn"("coupleId", "checkedAt");

-- CreateIndex
CREATE INDEX "MoodCheckIn_userId_checkedAt_idx" ON "MoodCheckIn"("userId", "checkedAt");

-- CreateIndex
CREATE INDEX "Wish_coupleId_status_idx" ON "Wish"("coupleId", "status");

-- CreateIndex
CREATE INDEX "Wish_creatorId_idx" ON "Wish"("creatorId");

-- CreateIndex
CREATE INDEX "Photo_coupleId_takenAt_idx" ON "Photo"("coupleId", "takenAt");

-- CreateIndex
CREATE INDEX "TimeCapsule_coupleId_unlockAt_idx" ON "TimeCapsule"("coupleId", "unlockAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentMemory_coupleId_key_key" ON "AgentMemory"("coupleId", "key");

-- CreateIndex
CREATE INDEX "AgentRun_coupleId_createdAt_idx" ON "AgentRun"("coupleId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentRun_userId_createdAt_idx" ON "AgentRun"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "CoupleMember" ADD CONSTRAINT "CoupleMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoupleMember" ADD CONSTRAINT "CoupleMember_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anniversary" ADD CONSTRAINT "Anniversary_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodCheckIn" ADD CONSTRAINT "MoodCheckIn_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodCheckIn" ADD CONSTRAINT "MoodCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wish" ADD CONSTRAINT "Wish_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wish" ADD CONSTRAINT "Wish_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeCapsule" ADD CONSTRAINT "TimeCapsule_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentMemory" ADD CONSTRAINT "AgentMemory_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
