-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_levels" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "forcastPrice" TEXT NOT NULL DEFAULT '1.00',
    "madeBy" INTEGER NOT NULL,
    CONSTRAINT "levels_madeBy_fkey" FOREIGN KEY ("madeBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_levels" ("id", "madeBy", "matchId", "name", "status") SELECT "id", "madeBy", "matchId", "name", "status" FROM "levels";
DROP TABLE "levels";
ALTER TABLE "new_levels" RENAME TO "levels";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
