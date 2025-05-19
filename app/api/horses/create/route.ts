import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface Horse {
  name: string;
  price: number;
  level_id: number;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { horses, username } = data;

    if (!horses || !username) {
      return NextResponse.json({ success: false, message: 'بيانات ناقصة' });
    }

    const user = await prisma.users.findFirst({
      where: {
        name: username,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' });
    }

    await Promise.all(
      horses.map(async (horse: Horse) => {
        const newHorse = await prisma.horses.create({
          data: {
            name: horse.name,
            initial_price: horse.price.toString(),
          },
        });

        await prisma.levelHorses.create({
          data: {
            level_id: horse.level_id,
            horseId: newHorse.id,
            madeBy: user.id,
          },
        });
      })
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'خطأ في الخادم' });
  }
}
