-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'DEBITED', 'CREDITED', 'FAILED');

-- CreateTable
CREATE TABLE "wallets" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" BIGSERIAL NOT NULL,
    "from_user" BIGINT NOT NULL,
    "to_user" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "idempotency_key" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "transaction_id" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "type" "LedgerType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "wallets_user_id_idx" ON "wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_idempotency_key_key" ON "transactions"("idempotency_key");

-- CreateIndex
CREATE INDEX "idx_from_user" ON "transactions"("from_user");

-- CreateIndex
CREATE INDEX "idx_to_user" ON "transactions"("to_user");

-- CreateIndex
CREATE INDEX "idx_status" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "idx_idempotency_key" ON "transactions"("idempotency_key");

-- CreateIndex
CREATE INDEX "idx_user_id" ON "ledger"("user_id");

-- CreateIndex
CREATE INDEX "idx_transaction_id" ON "ledger"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_created_at" ON "ledger"("created_at");
