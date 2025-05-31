-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_forcastCard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "betId" INTEGER NOT NULL,
    "firstHorse" INTEGER NOT NULL,
    "secondHorse" INTEGER NOT NULL,
    "ammount" TEXT NOT NULL,
    "levelId" INTEGER NOT NULL,
    CONSTRAINT "forcastCard_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "forcastCard_betId_fkey" FOREIGN KEY ("betId") REFERENCES "bets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "forcastCard_firstHorse_fkey" FOREIGN KEY ("firstHorse") REFERENCES "horses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "forcastCard_secondHorse_fkey" FOREIGN KEY ("secondHorse") REFERENCES "horses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_forcastCard" ("ammount", "betId", "firstHorse", "id", "levelId", "secondHorse") SELECT "ammount", "betId", "firstHorse", "id", "levelId", "secondHorse" FROM "forcastCard";
DROP TABLE "forcastCard";
ALTER TABLE "new_forcastCard" RENAME TO "forcastCard";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
