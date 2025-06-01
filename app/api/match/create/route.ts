import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const data = await req.json();
    const { matchName, levelsCount, username , discount } = data;

    if (Number(levelsCount) < 5) {
        return NextResponse.json({ success: false, message: 'عدد الاشواط يجب ان يكون خمسة او اكثر' });
    }

    const user = await prisma.users.findFirst({
        where: {
            name: username,
        },
    });

    if (!user) {
        return NextResponse.json({ success: false, message: 'المستخدم غير موجود' });
    }

    const newMatch = await prisma.matches.create({
        data: {
            name: matchName,
            madeBy: user.id,
            discount: discount,
        },
    });

    if (newMatch) {
        for (let i = 0; i < Number(levelsCount); i++) {
            await prisma.levels.create({
                data: {
                    name: 'الشوط ' + (i + 1),
                    matchId: newMatch.id,
                    madeBy: user.id,
                },
            });
        }

        return NextResponse.json({ success: true, matchId: newMatch.id });
    }

    return NextResponse.json({ success: false, message: 'حدث خطأ غير متوقع' });
}
