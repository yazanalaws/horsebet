import { getLevelWiners } from '@/lib/horses';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const match = await prisma.matches.findFirst({
        orderBy: {
            id: "desc",
        },
    });

    let betCount = 0;
    let total = 0;
    let cash = 0;
    let matchCardsCount = 0; // ✅ new counter

    if (match) {
        const levels = await prisma.levels.findMany({
            where: {
                matchId: match.id,
            },
        });

        const matchCards = await prisma.card.findMany({
            where: {
                bet: {
                    matchId: match.id,
                },
            },
            include: {
                combo: true,
            },
        });

        if (matchCards && levels.length > 0) {
           matchCardsCount = matchCards.length
        }

        const bets = await prisma.bets.findMany({
            where: {
                matchId: match.id,
            },
        });

        if (bets) {
            betCount = bets.length;
            for (const bet of bets) {
                const ammount = await prisma.card.findFirst({
                    where: {
                        betId: bet.id,
                    },
                });
                if (ammount) {
                    total = total + Number(ammount.ammount);
                }
            }
        }
    }

    cash = total * Number(match?.discount);

    return NextResponse.json({ success: true, data : {betCount, total, cash, matchCardsCount }});
}
