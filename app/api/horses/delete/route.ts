
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { horseId , levelId } = await req.json()

    if (!horseId) {
      return NextResponse.json({ success: false, message: 'Missing horse ID' }, { status: 400 })
    }

    await prisma.levelHorses.delete({
      where: { id: horseId  , level_id : levelId},
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
