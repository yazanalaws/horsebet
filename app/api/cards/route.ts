import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

    const data = await req.json()
    const {id} = data
    const cards = await prisma.card.findMany({
        where : {
            betId : Number(id)
        },
        include : {
            bet : {
                include : {
                    customer : true
                },

            },
            combo :  true

        },

    })
    return NextResponse.json({ success: true , cards })

}