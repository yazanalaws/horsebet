-- CreateTable
CREATE TABLE "winners" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "levelId" INTEGER NOT NULL,
    "firstHorse" INTEGER NOT NULL,
    "secondHorse" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "forcastCard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "betId" INTEGER NOT NULL,
    "firstHorse" INTEGER NOT NULL,
    "secondHorse" INTEGER NOT NULL,
    "ammount" INTEGER NOT NULL,
    CONSTRAINT "forcastCard_betId_fkey" FOREIGN KEY ("betId") REFERENCES "bets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    CONSTRAINT "bets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bets_madeBy_fkey" FOREIGN KEY ("madeBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_bets" ("customerId", "id", "isFoure", "isOne", "isThree", "isTow", "madeBy") SELECT "customerId", "id", "isFoure", "isOne", "isThree", "isTow", "madeBy" FROM "bets";
DROP TABLE "bets";
ALTER TABLE "new_bets" RENAME TO "bets";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
