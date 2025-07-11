/*
  Warnings:

  - Added the required column `order` to the `levelHorses` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_levelHorses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "horseId" INTEGER NOT NULL,
    "level_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "madeBy" INTEGER NOT NULL,
    CONSTRAINT "levelHorses_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "levelHorses_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "horses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "levelHorses_madeBy_fkey" FOREIGN KEY ("madeBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_levelHorses" ("horseId", "id", "level_id", "madeBy") SELECT "horseId", "id", "level_id", "madeBy" FROM "levelHorses";
DROP TABLE "levelHorses";
ALTER TABLE "new_levelHorses" RENAME TO "levelHorses";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
