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
      isForcast: false
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
    const levelWinners = await prisma.winners.findFirst({
      where: {
        levelId: bet.levelId
      }
    })

    const levelPrice = Number(bet.level.forcastPrice) * Number(match.discount);
    const winammount = Number(bet.ammount) * levelPrice;

    if (bet.firstHorse == levelWinners?.firstHorse && bet.secondHorse == levelWinners.secondHorse) {
      forcastWins += winammount;
    }

    forcastTotal += Number(bet.ammount);
  }

  for (const bet of bets) {
    const betHorses = await prisma.betHorses.findMany({
      where: {
        betId: bet.id
      }
    })
    for (const card of bet.card) {


      for (const combo of card.combo) {
        let comboData;
        totalAmmount += Number(card.ammount);
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
          const betHorsesPrice = allHorsesPrice.reduce((total, price) => total * price, 1);
          let roundedPrice = betHorsesPrice;
          const decimalPart = betHorsesPrice % 1;
          const secondDecimal = Math.floor(decimalPart * 100) % 10;
           if (betHorses.length > 2) {
            roundedPrice = betHorsesPrice * Number(match.discount);
          }
          if (decimalPart > 0) {
            const firstDecimal = Math.floor(decimalPart * 10) % 10;
            if (secondDecimal > 5) {
              roundedPrice = Math.floor(betHorsesPrice * 10) / 10 + 0.05;
            } else {
              roundedPrice = Math.floor(betHorsesPrice * 10) / 10;
            }
            // Ensure two decimals
            roundedPrice = Number(roundedPrice.toFixed(2));
          } else {
            roundedPrice = Number(betHorsesPrice.toFixed(2));
          }
          console.log(roundedPrice)
          const win = Number(card.ammount) * roundedPrice;
          winTotal += Number(win.toFixed(2));
        }
      }
    }
  }

  const netTotal = (totalAmmount + forcastTotal) * Number(match?.discount);

  return NextResponse.json({
    success: true,
    clientName,
    totalAmmount: totalAmmount + forcastTotal,
    netTotal,
    winTotal: winTotal + forcastWins,
    playWin: winTotal,
    matchName: match.name,
    matchDiscount : Number(match?.discount),
    forcastWins,
    forcastTotal
  });
}
