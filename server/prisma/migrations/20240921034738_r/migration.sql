/*
  Warnings:

  - You are about to drop the column `currency` on the `Recommendation` table. All the data in the column will be lost.
  - Added the required column `budgetBreakdown` to the `Recommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tips` to the `Recommendation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recommendation" DROP COLUMN "currency",
ADD COLUMN     "budgetBreakdown" TEXT NOT NULL,
ADD COLUMN     "tips" TEXT NOT NULL;
