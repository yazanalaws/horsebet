import { getLevelWiners } from '@/lib/horses';
import prisma from '@/lib/prisma';
import { matchStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { page = 1, pageSize = 10, customerName = ''  , winers = false} = await req.json();
  const skip = (page - 1) * pageSize;

  const match = await prisma.matches.findFirst({ orderBy: { id: 'desc' } });
  if (!match) {
    return NextResponse.json({ success: false, message: 'No match found.' });
  }

  const levels = await prisma.levels.findMany({
    where: { matchId: match.id },
    orderBy: { id: 'asc' },
  });
  if (!levels || levels.length === 0) {
    return NextResponse.json({ success: false, message: 'No levels registered.' });
  }

  const allLevelsEnded = levels.every(level => level.status === matchStatus.ENDED);

  // First get all combos with pagination
  const combos = await prisma.combo.findMany({
    skip,
    take: pageSize,
    where: {
      card: {
        bet: {
          matchId: match.id,
          customer: {
            name: { contains: customerName }
          }
        }
      }
    },
    include: {
      card: {
        include: {
          bet: {
            include: {
              customer: true
            }
          }
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  // Get total count of combos for pagination
  const totalCombos = await prisma.combo.count({
    where: {
      card: {
        bet: {
          matchId: match.id,
          customer: {
            name: { contains: customerName }
          }
        }
      }
    }
  });

  const tableRows = [];

  for (const combo of combos) {
    let comboData;
    try {
      comboData = JSON.parse(combo.combo);
    } catch (e) {
      continue;
    }

    const row: any = {
      id: combo.id,
      customer: combo.card.bet.customer.name,
      rowStatus: allLevelsEnded ? '' : 'غير متوفر',
      allLevelsEnded
    };

    let allHorsesWon = true;
    let horsesPrice = 0
    let prices = [] as number[]
    for (const level of levels) {
      const horseEntry = comboData.find((h: any) => h.levelId === level.id);
      const winners = await getLevelWiners(level.id);

      if (horseEntry && horseEntry.horseId > 0) {
        const horse = await prisma.horses.findUnique({
          where: { id: horseEntry.horseId },
          select: { name: true, initial_price: true, final_price: true },
        })
        //horsesPrice = Number((horsesPrice + Number(horse?.final_price)).toFixed(1));
        prices.push(Number(horse?.final_price))
        const isWinner = winners?.firstHorse === horseEntry.horseId;
        if (!isWinner) allHorsesWon = false;

        row[`level_${level.id}`] = {
          name: horse?.name || '-',
          winner: isWinner,
          status: level.status,


        };
        row['amount'] = combo.card.ammount
      } else {
        row[`level_${level.id}`] = { name: '-', winner: true, status: level.status };
      }
    }
    horsesPrice = prices.reduce((total, price) => total * price, 1);
    row['horsesPrice'] = horsesPrice.toFixed(1)

    row.rowStatus = allLevelsEnded ? allHorsesWon ? 'يربح' : 'يخسر' : 'قيد المراجعة';
    if(!winers){
        tableRows.push(row);
    }else{
        if(row.rowStatus == 'يربح'){
            tableRows.push(row)
        }
    }

  }

  return NextResponse.json({
    success: true,
    headers: ['id', 'الظريف', ...levels.map(l => l.name), 'الحالة' , 'سعر الخيول' , 'المبلغ'],
    data: tableRows,
    pagination: {
      page,
      pageSize,
      total: totalCombos // Now using total combos count
    }
  });
}