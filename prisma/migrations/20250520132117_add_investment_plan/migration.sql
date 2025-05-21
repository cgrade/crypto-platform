-- CreateEnum
CREATE TYPE "InvestmentPlan" AS ENUM ('STARTER', 'PREMIER', 'PREMIUM', 'SILVER', 'GOLD', 'PLATINUM', 'NONE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "investmentPlan" "InvestmentPlan" NOT NULL DEFAULT 'NONE';
