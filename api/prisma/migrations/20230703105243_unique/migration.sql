/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Device` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Data_deviceId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Device_name_key" ON "Device"("name");
