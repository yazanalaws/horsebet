import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface Horse {
  horseId: number;
  levelId: number;
}
interface Combination {
  horseId: number;
  levelId: number;
}

function getCombinations<T>(arr: T[], r: number): T[][] {
  const result: T[][] = [];
  function combine(start: number, combo: T[]): void {
    if (combo.length === r) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }
  combine(0, []);
  return result;
}

function normalizeCombination(combo: Horse[], allLevels: number[]): Combination[] {
  const map = new Map(combo.map(h => [h.levelId, h.horseId]));
  return allLevels.map(levelId => ({
    levelId,
    horseId: map.get(levelId) ?? 0
  }));
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { bet, username, matchId } = data;

    if (!bet || !username) {
      return NextResponse.json({ success: false, message: 'بيانات ناقصة' });
    }

    const user = await prisma.users.findFirst({ where: { name: username } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' });
    }

    const newBet = await prisma.bets.create({
      data: {
        customerId: bet.clientId,
        isOne: bet.isOne,
        isTow: bet.isTow,
        isThree: bet.isThree,
        isFoure: bet.isFoure,
        madeBy: user.id,
        matchId: matchId,
      },
    });

    if (newBet && bet.horses?.length > 0) {
      const horses: Horse[] = bet.horses;
      const allLevels = [...new Set(horses.map(h => h.levelId))].sort((a, b) => a - b);

      const processCombos = async (count: number) => {
        const card = await prisma.card.create({
          data: {
            betId: newBet.id,
            ammount: data.bet.ammount.toString(),
          },
        });

        if (card) {
          if (count === 1) {
            // Only ONE row with one horse per level (or 0 if not provided)
            const normalized = normalizeCombination(horses, allLevels);
            await prisma.combo.create({
              data: {
                betId: newBet.id,
                cardId: card.id,
                combo: JSON.stringify(normalized),
              },
            });
          } else {
            const combos = getCombinations(horses, count);
            for (const combo of combos) {
              const normalized = normalizeCombination(combo, allLevels);
              await prisma.combo.create({
                data: {
                  betId: newBet.id,
                  cardId: card.id,
                  combo: JSON.stringify(normalized),
                },
              });
            }
          }
        }
      };

      if (bet.isOne) await processCombos(1);
      if (bet.isTow) await processCombos(2);
      if (bet.isThree) await processCombos(3);
      if (bet.isFoure) await processCombos(4);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating bet:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ ما' });
  }
}
