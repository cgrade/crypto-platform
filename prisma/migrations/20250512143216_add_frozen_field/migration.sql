-- AlterTable
ALTER TABLE "CryptoAsset" ADD COLUMN     "frozen" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lastPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
