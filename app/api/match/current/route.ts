import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req:  NextRequest){

const currentMatch = await prisma.matches.findFirst({
    orderBy : {
        id : 'desc'
    }
})
return NextResponse.json({success : true , id :  currentMatch?.id || 0})

}