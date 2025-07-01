/*
  Warnings:

  - A unique constraint covering the columns `[mealDealId,articleId,categoryId,groupName]` on the table `MealDealItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MealDealItem_mealDealId_articleId_groupName_key";

-- AlterTable
ALTER TABLE "MealDealItem" ADD COLUMN     "categoryId" TEXT,
ALTER COLUMN "articleId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MealDealItem_mealDealId_articleId_categoryId_groupName_key" ON "MealDealItem"("mealDealId", "articleId", "categoryId", "groupName");

-- AddForeignKey
ALTER TABLE "MealDealItem" ADD CONSTRAINT "MealDealItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
