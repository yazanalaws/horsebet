-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_matches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "levelsCount" INTEGER NOT NULL DEFAULT 0,
    "discount" TEXT NOT NULL DEFAULT '0.80',
    "madeBy" INTEGER NOT NULL,
    CONSTRAINT "matches_madeBy_fkey" FOREIGN KEY ("madeBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_matches" ("id", "levelsCount", "madeBy", "name") SELECT "id", "levelsCount", "madeBy", "name" FROM "matches";
DROP TABLE "matches";
ALTER TABLE "new_matches" RENAME TO "matches";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
