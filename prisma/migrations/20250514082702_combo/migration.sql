/*
  Warnings:

  - You are about to drop the `paper` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "paper";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "combo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cardId" INTEGER NOT NULL,
    "betId" INTEGER NOT NULL,
    "combo" TEXT NOT NULL,
    CONSTRAINT "combo_betId_fkey" FOREIGN KEY ("betId") REFERENCES "bets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "combo_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "card" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
