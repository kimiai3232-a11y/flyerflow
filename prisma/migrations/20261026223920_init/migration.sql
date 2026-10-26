-- CreateTable
CREATE TABLE "Chain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "websiteUrl" TEXT NOT NULL,
    "flyerUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chainId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "phone" TEXT,
    "hours" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Store_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Flyer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chainId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "validFrom" DATETIME NOT NULL,
    "validTo" DATETIME NOT NULL,
    "flyerUrl" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Flyer_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flyerId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "brand" TEXT,
    "regularPrice" INTEGER,
    "salePrice" INTEGER NOT NULL,
    "unit" TEXT,
    "quantity" REAL,
    "imageUrl" TEXT,
    "productUrl" TEXT,
    "validFrom" DATETIME NOT NULL,
    "validTo" DATETIME NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SaleItem_flyerId_fkey" FOREIGN KEY ("flyerId") REFERENCES "Flyer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AffiliateLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chainId" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "paramName" TEXT NOT NULL DEFAULT 'aff_id',
    "paramValue" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AffiliateLink_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Chain_name_key" ON "Chain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Chain_slug_key" ON "Chain"("slug");

-- CreateIndex
CREATE INDEX "Store_city_province_idx" ON "Store"("city", "province");

-- CreateIndex
CREATE INDEX "Store_latitude_longitude_idx" ON "Store"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "Store_chainId_externalId_key" ON "Store"("chainId", "externalId");

-- CreateIndex
CREATE INDEX "Flyer_validFrom_validTo_idx" ON "Flyer"("validFrom", "validTo");

-- CreateIndex
CREATE INDEX "Flyer_status_idx" ON "Flyer"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Flyer_chainId_externalId_key" ON "Flyer"("chainId", "externalId");

-- CreateIndex
CREATE INDEX "SaleItem_category_idx" ON "SaleItem"("category");

-- CreateIndex
CREATE INDEX "SaleItem_salePrice_idx" ON "SaleItem"("salePrice");

-- CreateIndex
CREATE INDEX "SaleItem_validFrom_validTo_idx" ON "SaleItem"("validFrom", "validTo");

-- CreateIndex
CREATE UNIQUE INDEX "SaleItem_flyerId_externalId_key" ON "SaleItem"("flyerId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateLink_chainId_key" ON "AffiliateLink"("chainId");
