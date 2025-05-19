import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

    const data = await req.json()
    const { name, username } = data
    if (!name || !username) {
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

    const newClient = await prisma.customers.create({
        data: {
            name: name,
            madeBy: user.id
        }
    })
    if(newClient){
        return NextResponse.json({ success: true })
    }


}