"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type ForcastCard = {
  id: number;
  ammount: string;
  placement: string;
  first: { name: string };
  second: { name: string };
  level: { name: string , forcastPrice : string };
  cash?: string;
};

type Bet = {
  id: number;
  customer: { name: string };
  forcastCard: ForcastCard[];
  status: string;
};

export default function Page() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [winnersOnly, setWinnersOnly] = useState(false);
  const [matchData, setMatchData] = useState<{
   totalWinnings : number
   totalCash : number
   cash : number
  } | null>(null);

  const fetchBets = async (
    page: number = 1,
    search: string = "",
    winnersOnly: boolean = false
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/bets/forcast", {
        method: "POST",
        body: JSON.stringify({
          page,
          limit: 10,
          searchTerm: search,
          winnersOnly,
        }),
      });
      const data = await res.json();
      if (data.success) {

        setBets(data.bets);
        setTotalPages(data.totalPages);
        setMatchData({
         totalCash : data.totalCash,
         cash : data.cash,
         totalWinnings : data.totalWinnings
        })
      }
    } catch (error) {
      console.error("Failed to fetch bets:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBet = async (id: number) => {
    const res = await fetch("/api/bets/forcast/delete", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ betId: id }),
    });
    if (res.ok) {
      setBets((prev) => prev.filter((b) => b.id !== id));
      toast("تم حذف الرهان بنجاح");
    }
  };

  useEffect(() => {
    fetchBets(currentPage, searchTerm, winnersOnly);
  }, [currentPage, winnersOnly]);

  const updateProfit = async (betId: number, cardId: number, value: string) => {
    setBets((prevBets) =>
      prevBets.map((bet) =>
        bet.id === betId
          ? {
              ...bet,
              forcastCard: bet.forcastCard.map((card) =>
                card.id === cardId ? { ...card, cash: value } : card
              ),
            }
          : bet
      )
    );
    await fetch("/api/bets/forcast/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ betId, value }),
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBets(1, searchTerm, winnersOnly);
  };

  return (
    <div
      dir="rtl"
      className="w-[95%] m-auto h-screen mt-[60px] text-white text-lg"
    >
      <div className="flex flex-wrap gap-1 flex-row-reverse">
        <div className="flex-[calc(1/4*100%-4px)]">
          <div className="w-full p-1 h-32 flex flex-col gap-4 bg-white text-black rounded text-right">
            <h1>صندوق</h1>
            <p className="text-center text-2xl font-bold">
              {matchData?.totalCash}
            </p>
          </div>
        </div>
        <div className="flex-[calc(1/4*100%-4px)]">
          <div className="w-full p-1 h-32 flex flex-col gap-4 bg-white text-black rounded text-right">
            <h1> كاش</h1>
            <p className="text-center text-2xl font-bold">{matchData?.cash}</p>
          </div>
        </div>
        <div className="flex-[calc(1/4*100%-4px)]">
          <div className="w-full p-1 h-32 flex flex-col gap-4 bg-white text-black rounded text-right">
            <h1> اجمالي الربح</h1>
            <p className="text-center text-2xl font-bold">{matchData?.totalWinnings}</p>
          </div>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-4">رهانات الفوركاست</h1>

      <div className="flex justify-between mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="بحث باسم العميل"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 rounded text-black bg-white"
          />
          <button type="submit" className="bg-blue-500 px-4 py-1 rounded">
            بحث
          </button>
        </form>

        <div className="flex gap-2 justify-center items-center">
          <p>عرض الرابحين فقط</p>
          <input
            type="checkbox"
            checked={winnersOnly}
            onChange={(e) => {
              setWinnersOnly(e.target.checked);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <Table>
        <TableCaption>قائمة رهانات الفوركاست</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white text-center">ID</TableHead>
            <TableHead className="text-white text-center">الظريف</TableHead>
            <TableHead className="text-white text-center">الشوط</TableHead>
            <TableHead className="text-white text-center">
              الحصان الأول
            </TableHead>
            <TableHead className="text-white text-center">
              الحصان الثاني
            </TableHead>
            <TableHead className="text-white text-center">
              الترتيب بالأرقام
            </TableHead>
            <TableHead className="text-white text-center">الحالة</TableHead>
            <TableHead className="text-white text-center">المبلغ</TableHead>
            <TableHead className="text-white text-center">سعر فوركست</TableHead>
            <TableHead className="text-white text-center">الارباح</TableHead>
            <TableHead className="text-white text-center">خيارات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                جارٍ التحميل...
              </TableCell>
            </TableRow>
          ) : bets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                لا توجد رهانات.
              </TableCell>
            </TableRow>
          ) : (
            bets.map((bet) =>
              bet.forcastCard.map((card) => (
                <TableRow key={`${bet.id}-${card.id}`} id={`bet_${bet.id}`}>
                  <TableCell className="text-center">{bet.id}</TableCell>
                  <TableCell className="text-center">
                    {bet.customer.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {card.level.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {card.first.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {card.second.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {card.placement}
                  </TableCell>
                  <TableCell
                    style={{
                      background:
                        bet.status === "pending"
                          ? "orange"
                          : bet.status === "won"
                          ? "green"
                          : "red",
                    }}
                    className="text-center"
                  >
                    {bet.status === "pending"
                      ? "قيد الانتظار"
                      : bet.status === "won"
                      ? "ربح"
                      : "خسارة"}
                  </TableCell>
                  <TableCell className="text-center">{card.ammount}</TableCell>
                  <TableCell className="text-center">{card.level.forcastPrice}</TableCell>
                  <TableCell className="text-center">

                    <input
                      value={bet.status == 'won' ? Number(card.ammount) * (Number(card.level.forcastPrice) * 0.75) : ""}
                      readOnly
                      placeholder={
                        bet.status !== "won"
                          ? " متاح فقط للرهان الرابح"
                          : "{}"
                      }
                      className="bg-white text-black rounded p-1 w-full" />

                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => deleteBet(bet.id)}
                      className="rounded bg-red-600 px-2 py-1 text-white"
                    >
                      حذف
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50"
        >
          السابق
        </button>
        <span className="px-3 py-1">
          الصفحة {currentPage} من {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
