-- AlterTable
ALTER TABLE "allocations" ADD COLUMN     "cycle_version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "cycle_version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);
