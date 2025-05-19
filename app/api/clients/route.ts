import { client } from '@/app/types';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const clients = await prisma.customers.findMany({
        include: {
            user: true,
        },
    });

    const clientsData: client[] = await Promise.all(
        clients.map(async (client) => {
            const betCount = await prisma.bets.count({
                where: {
                    customerId: client.id,
                },
            });

            return {
                id: client.id,
                name: client.name,
                madeBy: client.user.name,
                betCount,
            };
        })
    );

    return NextResponse.json({ success: true, data: clientsData });
}
