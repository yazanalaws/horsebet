import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

    const data = await req.json()
    const { levelId, forcastPrice } = data
    if (!levelId || !forcastPrice) {
        return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }
    try {
        const update = await prisma.levels.update({
            where: { id: levelId },
            data: {
                forcastPrice: forcastPrice
            }
        })
        if (!update) {
            return NextResponse.json({ success: false, message: 'Level not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error updating level:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
    return NextResponse.json({ success: true })

}