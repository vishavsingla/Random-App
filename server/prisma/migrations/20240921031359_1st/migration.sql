/*
  Warnings:

  - You are about to drop the column `locations` on the `Itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `interests` on the `TravelPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `preferred_weather` on the `TravelPreferences` table. All the data in the column will be lost.
  - Made the column `userId` on table `Itinerary` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Itinerary" DROP CONSTRAINT "Itinerary_userId_fkey";

-- AlterTable
ALTER TABLE "Itinerary" DROP COLUMN "locations",
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "TravelPreferences" DROP COLUMN "interests",
DROP COLUMN "preferred_weather";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

-- CreateTable
CREATE TABLE "Interest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "preferencesId" INTEGER NOT NULL,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weather" (
    "id" SERIAL NOT NULL,
    "condition" TEXT NOT NULL,
    "preferencesId" INTEGER NOT NULL,

    CONSTRAINT "Weather_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "itineraryId" INTEGER NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_preferencesId_fkey" FOREIGN KEY ("preferencesId") REFERENCES "TravelPreferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weather" ADD CONSTRAINT "Weather_preferencesId_fkey" FOREIGN KEY ("preferencesId") REFERENCES "TravelPreferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
