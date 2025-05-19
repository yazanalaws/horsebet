/*
  Warnings:

  - Added the required column `horseId` to the `card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `levelId` to the `card` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "betId" INTEGER NOT NULL,
    "ammount" TEXT NOT NULL,
    "horseId" INTEGER NOT NULL,
    "levelId" INTEGER NOT NULL,
    CONSTRAINT "card_betId_fkey" FOREIGN KEY ("betId") REFERENCES "bets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "card_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "card_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "horses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_card" ("ammount", "betId", "id") SELECT "ammount", "betId", "id" FROM "card";
DROP TABLE "card";
ALTER TABLE "new_card" RENAME TO "card";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
