import { getLevelWiners } from '@/lib/horses';
import prisma from '@/lib/prisma';
import { matchStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { id } = data;

  let totalAmmount = 0;
  let winTotal = 0;
  let clientName = "";

  const match = await prisma.matches.findFirst({
    orderBy: {
      id: 'desc'
    }
  });

  if (!match) {
    return NextResponse.json({ success: false, message: 'No match found' });
  }

  const client = await prisma.customers.findUnique({
    where: { id }
  });

  if (!client) {
    return NextResponse.json({ success: false, message: 'Client not found' });
  }

  clientName = client.name;

  const levels = await prisma.levels.findMany({
    where: { matchId: match.id }
  });

  const allLevelsEnded = levels.every(level => level.status === matchStatus.ENDED);

  const bets = await prisma.bets.findMany({
    where: {
      customerId: client.id,
      matchId: match.id,
      isForcast: true
    },
    include: {
      card: {
        include: {
          combo: true
        }
      }
    }
  });
  let forcastWins = 0;
  let forcastTotal = 0;
  const forcast = await prisma.forcastCard.findMany({
    where: {
      bet: {
        customerId: client.id,
        matchId: match.id,
        isForcast: true
      }
    },
    include: {
      first: true,
      second: true,
      level: true
    }
  })
  for (const bet of forcast) {
    forcastWins += Number(bet.cash);
    forcastTotal += Number(bet.ammount);
  }
  for (const bet of bets) {
    for (const card of bet.card) {
      totalAmmount += Number(card.ammount);

      for (const combo of card.combo) {
        let comboData;

        try {
          comboData = JSON.parse(combo.combo);
        } catch (e) {
          continue;
        }

        let allHorsesWon = true;
        let allHorsesPrice: number[] = [];

        for (const level of levels) {
          const horseEntry = comboData.find((h: any) => h.levelId === level.id);
          const winners = await getLevelWiners(level.id);

          if (horseEntry && horseEntry.horseId > 0) {
            const isWinner = winners?.firstHorse === horseEntry.horseId;
            if (!isWinner) allHorsesWon = false;

            const horse = await prisma.horses.findUnique({
              where: { id: horseEntry.horseId },
              select: { final_price: true }
            });

            if (horse?.final_price) {
              allHorsesPrice.push(Number(horse.final_price));
            } else {
              allHorsesWon = false; // missing price = invalid
            }
          }
        }

        const isWinningCombo = allLevelsEnded && allHorsesWon;

        if (isWinningCombo) {
          const price = allHorsesPrice.reduce((total, price) => total * price, 1);
          const win = Number(card.ammount) * price;
          winTotal += Number(win.toFixed(1));
        }
      }
    }
  }

  const netTotal = totalAmmount * Number(match?.discount);

  return NextResponse.json({
    success: true,
    clientName,
    totalAmmount,
    netTotal,
    winTotal,
    matchName : match.name,
    forcastWins,
    forcastTotal
  });
}
