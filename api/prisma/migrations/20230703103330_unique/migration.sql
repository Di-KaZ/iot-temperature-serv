/*
  Warnings:

  - A unique constraint covering the columns `[deviceId]` on the table `Data` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Data_deviceId_key" ON "Data"("deviceId");
