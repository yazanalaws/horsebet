import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

    const data = await req.json()
    const {betId } = data
    const forcastCards = await prisma.forcastCard.deleteMany({
        where  : {
            betId : betId
        }
    })
    if(forcastCards) {
        await prisma.bets.delete({
            where : {
                id : betId
            }
        })
        return NextResponse.json({ success: true })
    }

}