import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

    const data = await req.json()
    const {betId } = data
    const cards = await prisma.card.findMany({
        where  : {
            betId  : betId
        }
    })
    await prisma.betHorses.deleteMany({
        where  : {
            betId : betId
        }
    })
    if(cards) {
        for(const card of cards ){
            await prisma.combo.deleteMany({
                where : {
                    cardId : card.id
                }
            })
        }
        await prisma.card.deleteMany({
            where  : {
                betId : betId
            }
        })
        await prisma.bets.delete({
            where : {
                id : betId
            }
        })
        return NextResponse.json({ success: true })
     }


}