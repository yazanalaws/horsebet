import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

    const data = await req.json()
    const { username, password } = data
    const checkUser  = await prisma.users.findFirst({
        where  : {
            name : username,
            password : password
        }
    })
    if(checkUser){
        return NextResponse.json({ success: true })
    }
    return NextResponse.json({ success: false })

}