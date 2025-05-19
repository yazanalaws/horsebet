/*
  Warnings:

  - Added the required column `levelId` to the `cash` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER NOT NULL,
    "isOne" BOOLEAN NOT NULL,
    "isTow" BOOLEAN NOT NULL,
    "isThree" BOOLEAN NOT NULL,
    "isFoure" BOOLEAN NOT NULL,
    "isForcast" BOOLEAN NOT NULL DEFAULT false,
    "madeBy" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "bets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bets_madeBy_fkey" FOREIGN KEY ("madeBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_bets" ("customerId", "id", "isForcast", "isFoure", "isOne", "isThree", "isTow", "madeBy") SELECT "customerId", "id", "isForcast", "isFoure", "isOne", "isThree", "isTow", "madeBy" FROM "bets";
DROP TABLE "bets";
ALTER TABLE "new_bets" RENAME TO "bets";
CREATE TABLE "new_cash" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "madeBy" INTEGER NOT NULL,
    "ammount" TEXT NOT NULL,
    "levelId" INTEGER NOT NULL
);
INSERT INTO "new_cash" ("ammount", "id", "madeBy") SELECT "ammount", "id", "madeBy" FROM "cash";
DROP TABLE "cash";
ALTER TABLE "new_cash" RENAME TO "cash";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
