import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface ComboEntry {
    levelId: number;
    horseId: number;
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const { matchId } = data;
    const match = await prisma.matches.findUnique({
        where : {
            id  : matchId
        }
    })
    const levels = await prisma.levels.findMany({
        where: { matchId },
        include: {
            levelHorses: {
                include: {
                    horse: true,
                },
            },

        },
    });

    const bets = await prisma.bets.findMany({
        where: { matchId },
        include: {
            card: {
                include: {
                    combo: true,
                },
            },
        },
    });

    const result: any[] = [];

    for (const level of levels) {
        const horses = level.levelHorses.map((lh) => lh.horse);
        const horseData: Record<number, any> = {};

        for (const horse of horses) {
            let horseLira = Number(horse.initial_price)
            if(!horse.initial_price || Number(horse.initial_price) == 0){
                 horseLira = Number(horse.final_price)
            }
            horseData[horse.id] = {
                horseId: horse.id,
                name: horse.name,
                startsWith: 0,
                endsWith: 0,
                price: horseLira,
                take: 0,
            };
        }

        for (const bet of bets) {
            for (const card of bet.card) {
                for (const comboEntry of card.combo) {
                    const combo: ComboEntry[] = JSON.parse(comboEntry.combo);

                    for (let i = 0; i < combo.length; i++) {
                        const entry = combo[i];

                        if (entry.levelId !== level.id || entry.horseId === 0) continue;

                        const horseId = entry.horseId;

                        const afterSlice = combo.slice(i + 1);
                        const beforeSlice = combo.slice(0, i);
                        const afterHasRealHorse = afterSlice.some((e) => e.horseId !== 0);
                        const afterAllZero = afterSlice.every((e) => e.horseId === 0);
                        const isFirstNonZero = combo.findIndex((e) => e.horseId !== 0) === i;
                        let horsePrice = horseData[horseId].price
                        if(horseData[horseId].price == 1){
                            horsePrice = Number(match?.discount)
                        }
                        const startsWith =
                            isFirstNonZero && afterHasRealHorse;

                        const endsWith =
                            afterSlice.length === 0 || afterAllZero;

                        if (startsWith) {
                            horseData[horseId].startsWith += Number(card.ammount);
                        }

                        if (endsWith) {
                            horseData[horseId].endsWith += Number(card.ammount);
                            horseData[horseId].take += Number(card.ammount) * horsePrice;
                        }
                        break;
                    }
                }
            }
        }

        result.push({
            levelId: level.id,
            levelName: level.name,
            horses: Object.values(horseData),
        });
    }

    return NextResponse.json({ success: true, data: result });
}
