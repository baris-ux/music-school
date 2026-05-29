-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('PER_SESSION', 'MONTHLY');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "paymentMode" "PaymentMode" NOT NULL DEFAULT 'PER_SESSION';
