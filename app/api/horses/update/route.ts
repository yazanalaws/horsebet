// app/api/horses/update/route.ts (or .ts if using the pages router)
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma' // Adjust path based on your setup

export async function POST(req: NextRequest) {
  try {
    const { horseId, name, initial_price, final_price } = await req.json()

    if (!horseId) {
      return NextResponse.json({ success: false, message: 'Missing horse ID' }, { status: 400 })
    }

    const updatedHorse = await prisma.horses.update({
      where: { id: horseId },
      data: {
        ...(name !== undefined && { name }),
        ...(initial_price !== undefined && { initial_price: initial_price.toString() }),
        ...(final_price !== undefined && { final_price: final_price.toString() }),
      },
    })

    return NextResponse.json({ success: true, horse: updatedHorse })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
