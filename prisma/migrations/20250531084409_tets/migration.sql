/*
  Warnings:

  - Added the required column `levelId` to the `betHorses` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_betHorses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "betId" INTEGER NOT NULL,
    "horseId" INTEGER NOT NULL,
    "levelId" INTEGER NOT NULL,
    CONSTRAINT "betHorses_betId_fkey" FOREIGN KEY ("betId") REFERENCES "bets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "betHorses_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "horses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_betHorses" ("betId", "horseId", "id") SELECT "betId", "horseId", "id" FROM "betHorses";
DROP TABLE "betHorses";
ALTER TABLE "new_betHorses" RENAME TO "betHorses";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
