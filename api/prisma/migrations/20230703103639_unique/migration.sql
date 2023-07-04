/*
  Warnings:

  - You are about to drop the column `temprature` on the `Data` table. All the data in the column will be lost.
  - Added the required column `temperature` to the `Data` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw" TEXT NOT NULL,
    "water" REAL NOT NULL,
    "conductivity" REAL NOT NULL,
    "temperature" REAL NOT NULL,
    CONSTRAINT "Data_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Data" ("conductivity", "createdAt", "deviceId", "id", "raw", "water") SELECT "conductivity", "createdAt", "deviceId", "id", "raw", "water" FROM "Data";
DROP TABLE "Data";
ALTER TABLE "new_Data" RENAME TO "Data";
CREATE UNIQUE INDEX "Data_deviceId_key" ON "Data"("deviceId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
