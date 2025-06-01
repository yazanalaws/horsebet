// /app/api/update-level/route.ts

import prisma from '@/lib/prisma'
import { broadcast } from '@/lib/see'
import { matchStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'


export async function POST(req: NextRequest) {
    const data = await req.json()
    const { levelId } = data

    const updatedLevel = await prisma.levels.update({
        where: { id: levelId },
        data: { status: matchStatus.PENDING },
    })
    if (updatedLevel) {
        await prisma.winners.deleteMany({
            where: { levelId }
        })
        //return NextResponse.json({ success: false, error: 'Level not found' }, { status: 404 })
    }

    // Broadcast to all clients
    broadcast({ type: 'LEVEL_UPDATE', levelId, matchStatus: matchStatus.PENDING })

    return NextResponse.json({ success: true })
}
