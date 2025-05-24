import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
    const match = await prisma.matches.findFirst({
        orderBy: {
            id: 'desc'
        }
    })
    if (match) {
        const combo = await prisma.combo.deleteMany({
            where: {
                card: {
                    bet: {
                        matchId: match.id
                    }
                }
            }
        })
        if (combo) {
            const cards = await prisma.card.deleteMany({
                where: {
                    bet: {
                        matchId: match.id
                    }
                }
            })
            if (cards) {
                const bets = await prisma.bets.deleteMany({
                    where: {
                        matchId: match.id
                    }
                })
                if (bets) {
                    const levelHorses = await prisma.levelHorses.deleteMany({
                        where: {
                            level: {
                                matchId: match.id
                            }
                        }
                    })

                    if (levelHorses) {

                        const levels = await prisma.levels.findMany({
                            where: {
                                matchId: match.id
                            }
                        })
                        if (levels) {
                            for (const level of levels) {
                                await prisma.winners.deleteMany({
                                    where: {
                                        levelId: level.id
                                    }
                                })
                            }
                        }
                        await prisma.levels.deleteMany({
                            where: {
                                matchId: match.id
                            }
                        })

                    }
                }
            }

        }

    }

    return NextResponse.json({ success: true })

}