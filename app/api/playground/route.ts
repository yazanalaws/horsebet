import { levelData } from '@/app/types';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { matchId } = data;

  const levels = await prisma.levels.findMany({
    where: {
      matchId: matchId
    }
  });

  const levelsData: levelData[] = await Promise.all(
    levels.map(async (level) => {
      const horses = await prisma.levelHorses.findMany({
        where: {
          level_id: level.id
        },
        include: {
          horse: true
        },
        orderBy : {
          order : 'asc'
        }
      });
      const winners = await prisma.winners.findFirst({
        where  : {
          levelId : level.id
        }
      })

      return {
        levelId: level.id,
        levelName : level.name,
        status : level.status,
        horses: horses.map((horse) => ({
          id: horse.horse.id,
          name: horse.horse.name,
          initial_price: horse.horse.initial_price,
          final_price: horse.horse.final_price
        })),
        firstWinnerId : winners?.firstHorse? winners?.firstHorse : null,
        secondWinnerId : winners?.secondHorse? winners?.secondHorse : null,
        forcastPrice : level.forcastPrice

      };
    })
  );

  return NextResponse.json({ success: true, levelsData });
}
