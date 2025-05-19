-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "matches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "madeBy" INTEGER NOT NULL,
    CONSTRAINT "matches_madeBy_fkey" FOREIGN KEY ("madeBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "levels" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "madeBy" INTEGER NOT NULL,
    CONSTRAINT "levels_madeBy_fkey" FOREIGN KEY ("madeBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "horses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "levelHorses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "horseId" INTEGER NOT NULL,
    "level_id" INTEGER NOT NULL,
    "madeBy" INTEGER NOT NULL,
    CONSTRAINT "levelHorses_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "levelHorses_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "horses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "levelHorses_madeBy_fkey" FOREIGN KEY ("madeBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER NOT NULL,
    "isOne" BOOLEAN NOT NULL,
    "isTow" BOOLEAN NOT NULL,
    "isThree" BOOLEAN NOT NULL,
    "isFoure" BOOLEAN NOT NULL,
    "madeBy" INTEGER NOT NULL,
    CONSTRAINT "bets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bets_madeBy_fkey" FOREIGN KEY ("madeBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "madeBy" INTEGER NOT NULL,
    CONSTRAINT "customers_madeBy_fkey" FOREIGN KEY ("madeBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "betId" INTEGER NOT NULL,
    "ammount" TEXT NOT NULL
);
