/*
  Warnings:

  - You are about to drop the column `horseId` on the `card` table. All the data in the column will be lost.
  - You are about to drop the column `levelId` on the `card` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "betId" INTEGER NOT NULL,
    "ammount" TEXT NOT NULL,
    CONSTRAINT "card_betId_fkey" FOREIGN KEY ("betId") REFERENCES "bets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_card" ("ammount", "betId", "id") SELECT "ammount", "betId", "id" FROM "card";
DROP TABLE "card";
ALTER TABLE "new_card" RENAME TO "card";
CREATE TABLE "new_matches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "levelsCount" INTEGER NOT NULL DEFAULT 0,
    "madeBy" INTEGER NOT NULL,
    CONSTRAINT "matches_madeBy_fkey" FOREIGN KEY ("madeBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_matches" ("id", "madeBy", "name") SELECT "id", "madeBy", "name" FROM "matches";
DROP TABLE "matches";
ALTER TABLE "new_matches" RENAME TO "matches";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
