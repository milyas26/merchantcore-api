/*
  Warnings:

  - A unique constraint covering the columns `[authUserId]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'DRAFT', 'DELETED', 'REVIEW');

-- CreateEnum
CREATE TYPE "AuthStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "authUserId" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "reviewComment" TEXT,
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "auth_users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "passwordHash" VARCHAR(255),
    "googleOauthId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "status" "AuthStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "auth_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_email_key" ON "auth_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_googleOauthId_key" ON "auth_users"("googleOauthId");

-- CreateIndex
CREATE INDEX "auth_users_status_idx" ON "auth_users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "customers_authUserId_key" ON "customers"("authUserId");

-- CreateIndex
CREATE INDEX "products_status_statusChangedAt_idx" ON "products"("status", "statusChangedAt");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_authUserId_fkey" FOREIGN KEY ("authUserId") REFERENCES "auth_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
