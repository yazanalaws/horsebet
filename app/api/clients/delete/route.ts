import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

    const data = await req.json()
    const { id } = data
    const combos = await prisma.combo.deleteMany({
        where: {
            card: {
                bet: {
                    customerId: Number(id)
                }
            }
        }
    })
    if (combos) {
        const cards = await prisma.card.deleteMany({
            where: {
                bet: {
                    customerId: Number(id)
                }
            }
        })
        if(cards){


        const bets = await prisma.bets.deleteMany({
            where: {
                customerId: Number(id)
            }
        })
        if(bets){
            await prisma.customers.delete({
                where  : {
                    id : Number(id)
                }
            })
        }
       }
    }


    return NextResponse.json({ success: true })

}