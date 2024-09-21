/*
  Warnings:

  - You are about to drop the column `budget` on the `Itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `days` on the `Itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `interests` on the `Itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `preferences` on the `Itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `tripType` on the `Itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[travelPrefsId]` on the table `Itinerary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `details` to the `Itinerary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `travelPrefsId` to the `Itinerary` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Itinerary" DROP CONSTRAINT "Itinerary_userId_fkey";

-- DropIndex
DROP INDEX "User_googleId_key";

-- AlterTable
ALTER TABLE "Itinerary" DROP COLUMN "budget",
DROP COLUMN "category",
DROP COLUMN "days",
DROP COLUMN "interests",
DROP COLUMN "location",
DROP COLUMN "preferences",
DROP COLUMN "tripType",
DROP COLUMN "userId",
ADD COLUMN     "details" TEXT NOT NULL,
ADD COLUMN     "locations" TEXT[],
ADD COLUMN     "travelPrefsId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "googleId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "TravelPreferences" (
    "id" SERIAL NOT NULL,
    "travel_type" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "local_budget" DOUBLE PRECISION NOT NULL,
    "interests" TEXT[],
    "trip_duration" INTEGER NOT NULL,
    "number_of_travelers" INTEGER NOT NULL,
    "traveling_with_children" BOOLEAN NOT NULL,
    "preferred_weather" TEXT[],
    "other_requirements" TEXT,
    "residence_country" TEXT,
    "currency" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" SERIAL NOT NULL,
    "itineraryId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ItineraryToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ItineraryToUser_AB_unique" ON "_ItineraryToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ItineraryToUser_B_index" ON "_ItineraryToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Itinerary_travelPrefsId_key" ON "Itinerary"("travelPrefsId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "TravelPreferences" ADD CONSTRAINT "TravelPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_travelPrefsId_fkey" FOREIGN KEY ("travelPrefsId") REFERENCES "TravelPreferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItineraryToUser" ADD CONSTRAINT "_ItineraryToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItineraryToUser" ADD CONSTRAINT "_ItineraryToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
