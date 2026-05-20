-- AlterTable
ALTER TABLE "Couple" ADD COLUMN     "invite_code_created_at" TIMESTAMP(3),
ADD COLUMN     "invite_code_expires_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "WishStatusHistory" (
    "id" TEXT NOT NULL,
    "wishId" TEXT NOT NULL,
    "fromStatus" "WishStatus",
    "toStatus" "WishStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WishStatusHistory_wishId_changedAt_idx" ON "WishStatusHistory"("wishId", "changedAt");

-- AddForeignKey
ALTER TABLE "WishStatusHistory" ADD CONSTRAINT "WishStatusHistory_wishId_fkey" FOREIGN KEY ("wishId") REFERENCES "Wish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishStatusHistory" ADD CONSTRAINT "WishStatusHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
