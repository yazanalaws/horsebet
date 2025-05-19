"use client";

import { cards as CardType } from '@/app/types';
import React, { use, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Suspense } from 'react'

interface PageProps {
    params: Promise<{ id: number }>; // `params` is now a Promise
}
export default function Page({ params }: PageProps) {
  const [cards, setCards] = useState<CardType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = use(params);

  useEffect(() => {
    const getBetCards = async () => {
      try {
        const res = await fetch('/api/cards', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id })
        });

        if (res.ok) {
          const data = await res.json();
          setCards(data.cards);
        }
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!cards && id) {
      getBetCards();
    }
  }, [id]);

  return (
    <Suspense>
    <div className="w-[95%] m-auto h-screen mt-[60px] text-white text-lg">
      <Table>
        <TableCaption>قائمة الأوراق المرتبطة بالرهان</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center text-white">رقم الرهان</TableHead>
            <TableHead className="text-center text-white">اسم العميل</TableHead>
            <TableHead className="text-center text-white"> عدد الأحتمالات </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">جارٍ التحميل...</TableCell>
            </TableRow>
          ) : !cards || cards.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">لا توجد أوراق.</TableCell>
            </TableRow>
          ) : (
            cards.map((card, index) => (
              <TableRow key={index}>
                <TableCell className="text-center">{card.bet.id}</TableCell>
                <TableCell className="text-center">{card.bet.customer.name}</TableCell>
                <TableCell className="text-center">{card.combo.length}</TableCell>

              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
    </Suspense>
  );
}
