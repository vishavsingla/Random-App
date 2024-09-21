/*
  Warnings:

  - You are about to drop the column `price` on the `Recommendation` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Recommendation` table. All the data in the column will be lost.
  - You are about to drop the `_ItineraryToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `accommodation` to the `Recommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Recommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diningOptions` to the `Recommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationName` to the `Recommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recommendedActivities` to the `Recommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `safetyTips` to the `Recommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transportation` to the `Recommendation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ItineraryToUser" DROP CONSTRAINT "_ItineraryToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ItineraryToUser" DROP CONSTRAINT "_ItineraryToUser_B_fkey";

-- AlterTable
ALTER TABLE "Itinerary" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Recommendation" DROP COLUMN "price",
DROP COLUMN "type",
ADD COLUMN     "accommodation" TEXT NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "diningOptions" TEXT NOT NULL,
ADD COLUMN     "locationName" TEXT NOT NULL,
ADD COLUMN     "recommendedActivities" TEXT NOT NULL,
ADD COLUMN     "safetyTips" TEXT NOT NULL,
ADD COLUMN     "transportation" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "_ItineraryToUser";

-- AddForeignKey
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
