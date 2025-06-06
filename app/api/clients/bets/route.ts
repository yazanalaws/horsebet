import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const page = parseInt(body.page) || 1;
    const limit = parseInt(body.limit) || 10;
    const search = body.search || '';
    const id = parseInt(body.id)
    const match = await prisma.matches.findFirst({
      orderBy: {
        id: 'desc'
      }
    })
    const skip = (page - 1) * limit;
    if (!match) {
      return NextResponse.json(
        { success: false, message: 'حدث خطأ أثناء جلب البيانات.' },
        { status: 500 }
      );
    }


    const [bets, total] = await Promise.all([
      prisma.bets.findMany({
        where: {
            customerId : id,
            isForcast :  false
        },
        include: {
          user: true,
          customer: true,
          card: true,
          combo: true,
          betHorses: {
            include: {
              horse: true,
            }
          },
          forcastCard: {
            select: {
              firstHorse: true,
              secondHorse: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { id: 'desc' }
      }),
      prisma.bets.count({
        where: {
            customerId : id,
            isForcast : false
        }
      })
    ]);
    const levels = await prisma.levels.findMany({
      where: { matchId: bets[0]?.matchId },
    })
    return NextResponse.json({
      success: true,
      bets,
      levels,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب البيانات.' },
      { status: 500 }
    );
  }
}
