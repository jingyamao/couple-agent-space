-- AlterTable
ALTER TABLE "AuthSession" ADD COLUMN     "device_name" TEXT,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "user_agent" TEXT;
