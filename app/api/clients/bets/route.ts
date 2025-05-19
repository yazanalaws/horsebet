
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export async function POST(req: NextRequest) {

    const data = await req.json()
    const { id } = data
    const bets = await prisma.bets.findMany({
        where: {
            customerId: Number(id)
        },
        include: {
            user: true,
            customer: true,
            card: {

            }
        },
    })

    return NextResponse.json({ success: true, bets })

}