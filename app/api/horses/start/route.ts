import { getLevelWiners } from '@/lib/horses';
import prisma from '@/lib/prisma';
import { matchStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

interface ComboEntry {
    levelId: number;
    horseId: number;
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const { matchId } = data;
    const match = await prisma.matches.findFirst({
        orderBy: {
            id: "desc"
        }
    })
    if (!match) {
        return NextResponse.json({ success: false });
    }
    const levels = await prisma.levels.findMany({
        where: { matchId: match.id },
        include: {
            levelHorses: {
                include: {
                    horse: true,
                },
            },
        },
    });

    const bets = await prisma.bets.findMany({
        where: { matchId: match.id },
        include: {
            card: {
                include: {
                    combo: true,
                },
            },
            betHorses: true
        },
    });

    const result: any[] = [];

    // First, get all winners for ended levels
    const endedLevels = levels.filter(level => level.status === matchStatus.ENDED);
    const levelWinnersMap: Record<number, {firstHorse: number, secondHorse: number}> = {};

    for (const level of endedLevels) {
        const winners = await prisma.winners.findFirst({
            where: { levelId: level.id }
        });
        if (winners) {
            levelWinnersMap[level.id] = {
                firstHorse: winners.firstHorse,
                secondHorse: winners.secondHorse
            };
        }
    }

    for (const level of levels) {
        const horses = level.levelHorses.map((lh) => lh.horse);
        const horseData: Record<number, any> = {};
        const forcasts = await prisma.forcastCard.findMany({
            where: {
                levelId: level.id,
            }
        })
        let totalForcast = 0;
        let totalForcastWins = 0;
        for (const forcast of forcasts) {
            totalForcast += Number(forcast.ammount);
            const levelWinners = levelWinnersMap[level.id];
            if (levelWinners) {
                if (forcast.firstHorse == levelWinners.firstHorse && forcast.secondHorse == levelWinners.secondHorse) {
                    const levelPrice = Number(level.forcastPrice) - 0.25;
                    const winAmmount = Number(forcast.ammount) * levelPrice
                    totalForcastWins += winAmmount;
                }
            }
        }

        for (const horse of horses) {
            let horseLira = Number(horse.initial_price)
            if (!horse.initial_price || Number(horse.initial_price) == 0) {
                horseLira = Number(horse.final_price)
            }
            if (level.status == matchStatus.PENDING || level.status == matchStatus.STARTED) {
                horseData[horse.id] = {
                    horseId: horse.id,
                    name: horse.name,
                    startsWith: 0,
                    endsWith: 0,
                    price: horseLira,
                    take: 0,
                };
            } else if (level.status == matchStatus.ENDED) {
                const winningHorses = levelWinnersMap[level.id];
                if (winningHorses && winningHorses.firstHorse == horse.id) {
                    horseData[horse.id] = {
                        horseId: horse.id,
                        name: horse.name,
                        startsWith: 0,
                        endsWith: 0,
                        price: horseLira,
                        take: 0,
                    };
                }
            }
        }

        for (const bet of bets) {
            for (const card of bet.card) {
                for (const comboEntry of card.combo) {
                    const combo: ComboEntry[] = JSON.parse(comboEntry.combo);

                    // Check if any entry in the combo has a losing horse in ended levels
                    let hasLosingHorse = false;
                    for (const entry of combo) {
                        if (entry.horseId === 0) continue;

                        const levelStatus = levels.find(l => l.id === entry.levelId)?.status;
                        if (levelStatus === matchStatus.ENDED) {
                            const winners = levelWinnersMap[entry.levelId];
                            if (winners && entry.horseId !== winners.firstHorse) {
                                hasLosingHorse = true;
                                break;
                            }
                        }
                    }

                    if (hasLosingHorse) continue;

                    for (let i = 0; i < combo.length; i++) {
                        const entry = combo[i];
                        if (entry.levelId !== level.id || entry.horseId === 0) continue;

                        const horseId = entry.horseId;
                        const afterSlice = combo.slice(i + 1);
                        const beforeSlice = combo.slice(0, i);
                        const afterHasRealHorse = afterSlice.some((e) => e.horseId !== 0);
                        const afterAllZero = afterSlice.every((e) => e.horseId === 0);
                        const isFirstNonZero = combo.findIndex((e) => e.horseId !== 0) === i;
                        let horsePrice = horseData[horseId]?.price || 0;

                        if (horsePrice > 0) {
                            if (bet.betHorses.length < 2) {
                                horsePrice = Number(match?.discount);
                            }
                            const startsWith = isFirstNonZero && afterHasRealHorse;
                            const endsWith = afterSlice.length === 0 || afterAllZero;

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
        }

        result.push({
            levelId: level.id,
            levelName: level.name,
            horses: Object.values(horseData),
            totalForcast: totalForcast,
            totalForcastWins: totalForcastWins,
        });
    }

    return NextResponse.json({ success: true, data: result });
}