import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

    const data = await req.json()
    const { betId, value } = data;
    if (!betId || !value) {
        return NextResponse.json({ success: false, message: 'Bet ID and value are required' }, { status: 400 });
    }
    await prisma.forcastCard.updateMany({
        where: {
            betId: betId,
        },
        data: {
            cash: value,
        },
    })
    return NextResponse.json({ success: true })

}