// /app/api/update-level/route.ts

import prisma from '@/lib/prisma'
import { broadcast } from '@/lib/see'
import { NextRequest, NextResponse } from 'next/server'


export async function POST(req: NextRequest) {
  const data = await req.json()
  const { levelId, status } = data

  const updatedLevel = await prisma.levels.update({
    where: { id: levelId },
    data: { status },
  })

  // Broadcast to all clients
  broadcast({ type: 'LEVEL_UPDATE', levelId, status })

  return NextResponse.json({ success: true })
}
