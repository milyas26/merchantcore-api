-- CreateTable
CREATE TABLE "promotion_products" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promotion_products_promotionId_idx" ON "promotion_products"("promotionId");

-- CreateIndex
CREATE INDEX "promotion_products_productId_idx" ON "promotion_products"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_products_promotionId_productId_key" ON "promotion_products"("promotionId", "productId");

-- AddForeignKey
ALTER TABLE "promotion_products" ADD CONSTRAINT "promotion_products_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_products" ADD CONSTRAINT "promotion_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
