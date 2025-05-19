import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

    const data = await req.json()
    const { matchId } = data
    const levels = await prisma.levels.findMany(
        {
            where: {
                matchId: Number(matchId)
            }
        }
    )
    if (levels) {
        return NextResponse.json({ success: true, levels })
    }


}