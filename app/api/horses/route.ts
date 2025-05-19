import { levelData } from '@/app/types';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

    const match = await prisma.matches.findFirst({
        orderBy: {
            id: 'desc'
        }
    })
    const levelsData: levelData[] = [];


    if (match) {
        const levels = await prisma.levels.findMany({
            where: {
                matchId: match.id
            },
            include: {
                levelHorses: {
                    include: {
                        horse: true
                    }
                }
            }
        })
        if (levels) {
            for (const level of levels) {
            const leveColmn = {

                levelId: level.id,
                levelName: level.name,
                status: level.status,
                horses: level.levelHorses.map((horse) => ({
                    id: horse.horse.id,
                    name: horse.horse.name,
                    initial_price: horse.horse.initial_price,
                    final_price: horse.horse.final_price
                })),
                firstWinnerId: null,
                secondWinnerId: null
            }
                levelsData.push(
                leveColmn
                ) ;

            }
        }

    }

    return NextResponse.json({ success: true , levelsData })

}