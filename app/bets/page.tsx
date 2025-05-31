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
import { Bet } from "../types";
import Link from "next/link";
import { toast } from "sonner";
import { levels } from "@prisma/client";

export default function Page() {
  const [clients, setClients] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [levels, setLevels] = useState<levels[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        body: JSON.stringify({ search, page, limit }),
      });
      const data = await res.json();
      if (data.success) {
        setClients(data.bets);
        setTotalPages(data.pagination?.totalPages || 1);
        setLevels(data.levels || []);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchClients();
  };
  const deleteBet = async (id: number) => {
    const res = await fetch("/api/bets/delete", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        betId: id,
      }),
    });
    if (res.ok) {
      const bet = document.getElementById(`bet_${id}`);
      bet?.remove();
      toast("تم حذف الرهان بنجاح");
    }
  };
  return (
    <div dir="rtl" className="w-[95%] m-auto h-screen mt-[60px] text-white text-lg">
      <form onSubmit={handleSearch} className="mb-4 ml-auto flex gap-2">
        <button className="rounded p-2 bg-green-500 text-white" type="submit">
          بحث
        </button>
        <input
          placeholder="ابحث عن عميل أو مستخدم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-black rounded bg-white p-2"
        />
      </form>

      <Table>
        <TableCaption>قائمة العملاء والمراهنات الخاصة بهم</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white text-center">ID</TableHead>
            <TableHead className="text-white text-center">العميل</TableHead>
            <TableHead className="text-white text-center">
              عدد الأوراق
            </TableHead>
            {levels.length > 0 &&
              levels.map((level) => (
                <TableHead key={level.id} className="text-white text-center">
                  {level.name}
                </TableHead>
              ))}
            <TableHead className="text-white text-center">خيارات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                جارٍ التحميل...
              </TableCell>
            </TableRow>
          ) : clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                لا يوجد عملاء.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id} id={`bet_${client.id}`}>
                <TableCell className="text-center">{client.id}</TableCell>
                <TableCell className="text-center">
                  {client.customer.name}
                </TableCell>
                <TableCell className="text-center">
                  <Link href={"/comb/bet/" + client.id}>
                    {client.combo.length || 0}
                  </Link>
                </TableCell>
                {levels.map((level) => {
                  const horseInLevel = client.betHorses.find(
                    (betHorse) => betHorse.levelId === level.id
                  );

                  return (
                    <TableCell key={level.id} className="text-center">
                      {horseInLevel && horseInLevel.horseId !== 0 ? (
                        <Link href={`/horses/${horseInLevel.horseId}`}>
                          {horseInLevel.horse.name}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  );
                })}

                <TableCell className="text-center">
                  <button
                    type="button"
                    onClick={() => deleteBet(client.id)}
                    className="rounded bg-red-600 px-2 py-1  text-white"
                  >
                    حذف
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          السابق
        </button>
        <span>
          الصفحة {page} من {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
        >
          التالي
        </button>
      </div>
    </div>
  );
}
