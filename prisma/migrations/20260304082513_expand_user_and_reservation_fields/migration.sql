/*
  Warnings:

  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hotelId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "guests" INTEGER NOT NULL DEFAULT 1,
    "checkIn" DATETIME,
    "checkOut" DATETIME,
    "nights" INTEGER NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "postalCode" TEXT,
    "country" TEXT,
    "stateCity" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "cardHolder" TEXT,
    "cardLast4" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reservation_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("createdAt", "email", "hotelId", "id", "name") SELECT "createdAt", "email", "hotelId", "id", "name" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "bookingEmail" TEXT,
    "phone" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "stateCity" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "heightCm" INTEGER NOT NULL DEFAULT 170,
    "bodyWidthPercent" INTEGER NOT NULL DEFAULT 100,
    "cardEncrypted" TEXT,
    "cardLast4" TEXT,
    "cardHolder" TEXT,
    "cardExpMonth" INTEGER,
    "cardExpYear" INTEGER,
    "cardCvcEncrypted" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("bodyWidthPercent", "bookingEmail", "cardEncrypted", "cardLast4", "createdAt", "email", "heightCm", "id", "name", "passwordHash", "phone", "updatedAt") SELECT "bodyWidthPercent", "bookingEmail", "cardEncrypted", "cardLast4", "createdAt", "email", "heightCm", "id", "name", "passwordHash", "phone", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
