import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { page = 1, limit = 10, searchTerm = "", winnersOnly = false } = data;

  const currentPage = Math.max(Number(page), 1);
  const itemsPerPage = Math.max(Number(limit), 1);
  const skip = (currentPage - 1) * itemsPerPage;

  const match = await prisma.matches.findFirst({
    orderBy: {
      id: 'desc',
    },
  });

  if (!match) {
    return NextResponse.json({ success: false, message: 'No match found' }, { status: 404 });
  }

  // Get total count for pagination
  const totalBets = await prisma.bets.count({
    where: {
      isForcast: true,
      matchId: match.id,
      customer: {
        name: {
          contains: searchTerm,
        }
      }
    },
  });
  const totalPages = Math.ceil(totalBets / itemsPerPage);

  const bets = await prisma.bets.findMany({
    where: {
      isForcast: true,
      matchId: match.id,
      customer: {
        name: {
          contains: searchTerm,
        }
      }
    },
    include: {
      forcastCard: {
        include: {
          first: true,
          second: true,
          level: true,
        },
      },
      customer: true
    },
    skip,
    take: itemsPerPage,
    orderBy: {
      id: 'desc'
    }
  });
  let totalCash = 0;
  let totalWinnings = 0;
  let cash = 0
  const updatedBets = [];

  for (const bet of bets) {
    const card = bet.forcastCard[0]; // assuming only one forecast card per bet
    if (!card) {
      updatedBets.push(bet);
      continue;
    }

    const levelHorses = await prisma.levelHorses.findMany({
      where: {
        level_id: card.levelId,
      },
    });

    const firstPlacement = levelHorses.findIndex(h => h.horseId === card.firstHorse) + 1;
    const secondPlacement = levelHorses.findIndex(h => h.horseId === card.secondHorse) + 1;
    totalCash += Number(card.ammount);
    const placementString = `${firstPlacement}/${secondPlacement}`;
    let status = 'pending';
    const levelWinners = await prisma.winners.findFirst({
      where: {
        levelId: card.levelId,
      }
    });

    if (levelWinners) {
      if (levelWinners.firstHorse === card.firstHorse && levelWinners.secondHorse === card.secondHorse) {
        const levelPrice = Number(card.level.forcastPrice) - 0.25;
        totalWinnings += Number(card.ammount) * levelPrice;
        status = 'won';
      } else {
        status = 'lost';
      }
    }

    // Skip if winnersOnly is true and bet is not won
    if (winnersOnly && status !== 'won') {
      continue;
    }

    // Attach the placement to the forecast card
    const updatedCard = {
      ...card,
      placement: placementString,
    };

    updatedBets.push({
      ...bet,
      forcastCard: [updatedCard],
      status
    });
  }

  return NextResponse.json({
    success: true,
    bets: updatedBets,
    totalPages,
    totalWinnings,
    totalCash,
    cash :  totalCash * Number(match.discount),
    currentPage
  });
}