import prisma from '@/lib/prisma';
import { broadcast } from '@/lib/see';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

    const data = await req.json()
    const { levelId, firstHorseId, secondHorseId } = data
    const setWinners = await prisma.winners.create({
        data: {
            levelId: levelId,
            firstHorse: Number(firstHorseId),
            secondHorse: Number(secondHorseId)
        }
    })
    if (setWinners) {
      broadcast({ type: 'LEVEL_UPDATE', levelId, firstWinnerId : firstHorseId , secondWinnerId : secondHorseId })
    }
    return NextResponse.json({ success: true })

}