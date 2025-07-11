import { getLevelWiners } from '@/lib/horses';
import prisma from '@/lib/prisma';
import { matchStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { page = 1, pageSize = 10, customerId, winers = false } = await req.json();
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
            id: customerId
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
            id: customerId
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
    let horsesCount = 0;
    for (const level of levels) {
      const horseEntry = comboData.find((h: any) => h.levelId === level.id);
      const winners = await getLevelWiners(level.id);

      if (horseEntry && horseEntry.horseId > 0) {
        horsesCount = horsesCount + 1;
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
    const allhorsesPrice = prices.reduce((total, price) => total * price, 1);

    // Custom rounding: if second decimal digit > 5, round to .x5, else to .x0
    let roundedPrice = allhorsesPrice;
    const decimalPart = roundedPrice % 1;
    const secondDecimal = Math.floor(decimalPart * 100) % 10;
    if (horsesCount == 1) {
      roundedPrice = allhorsesPrice - 0.25
    } else {
      if (decimalPart > 0) {
        const firstDecimal = Math.floor(decimalPart * 10) % 10;
        if (secondDecimal > 5) {
          roundedPrice = Math.floor(roundedPrice * 10) / 10 + 0.05;
        } else {
          roundedPrice = Math.floor(roundedPrice * 10) / 10;
        }
        // Ensure two decimals
        roundedPrice = Number(roundedPrice.toFixed(2));
      } else {
        roundedPrice = Number(roundedPrice.toFixed(2));
      }
    }

    //console.log(horsesCount)

    row['horsesPrice'] = roundedPrice;

    row.rowStatus = allLevelsEnded ? allHorsesWon ? 'يربح' : 'يخسر' : 'قيد المراجعة';
    if (!winers) {
      tableRows.push(row);
    } else {
      if (row.rowStatus == 'يربح') {
        tableRows.push(row)
      }
    }

  }

  return NextResponse.json({
    success: true,
    headers: ['id', 'الظريف', ...levels.map(l => l.name), 'الحالة', 'سعر الخيول', 'المبلغ'],
    data: tableRows,
    pagination: {
      page,
      pageSize,
      total: totalCombos // Now using total combos count
    }
  });
}