-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_horses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "initial_price" TEXT NOT NULL DEFAULT '1.00',
    "final_price" TEXT NOT NULL DEFAULT '1.00'
);
INSERT INTO "new_horses" ("final_price", "id", "initial_price", "name") SELECT coalesce("final_price", '1.00') AS "final_price", "id", coalesce("initial_price", '1.00') AS "initial_price", "name" FROM "horses";
DROP TABLE "horses";
ALTER TABLE "new_horses" RENAME TO "horses";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
