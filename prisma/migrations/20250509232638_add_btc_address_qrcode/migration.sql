/*
  Warnings:

  - The values [USDT] on the enum `CryptoType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CryptoType_new" AS ENUM ('BTC');
ALTER TABLE "Transaction" ALTER COLUMN "cryptoType" TYPE "CryptoType_new" USING ("cryptoType"::text::"CryptoType_new");
ALTER TYPE "CryptoType" RENAME TO "CryptoType_old";
ALTER TYPE "CryptoType_new" RENAME TO "CryptoType";
DROP TYPE "CryptoType_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "btcAddress" TEXT,
ADD COLUMN     "btcAddressQrCode" TEXT;
