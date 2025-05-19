"use client";

import React, { use, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bet } from "@/app/types";
import Link from "next/link";
interface PageProps {
    params: Promise<{ id: number }>; // `params` is now a Promise
}
import { Suspense } from 'react'
export default function Page({ params }: PageProps) {
  const { id } = use(params);
  const [clients, setClients] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients/bets", {
        method: "POST",
        body: JSON.stringify({ id : id }),
      });
      const data = await res.json();
      if (data.success) {
        setClients(data.bets);
        setTotalPages(data.pagination?.totalPages || 1);
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

  return (
    <Suspense>
    <div className="w-[95%] m-auto h-screen mt-[60px] text-white text-lg">

      <Table>
        <TableCaption>قائمة العملاء والمراهنات الخاصة بهم</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white text-center">ID</TableHead>
            <TableHead className="text-white text-center">العميل</TableHead>
            <TableHead className="text-white text-center">عدد الأوراق</TableHead>
            <TableHead className="text-white text-center">ورقة واحدة؟</TableHead>
            <TableHead className="text-white text-center">ثنائية؟</TableHead>
            <TableHead className="text-white text-center">تريانغ؟</TableHead>
            <TableHead className="text-white text-center">رباعية؟</TableHead>
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
              <TableRow key={client.id}>
                <TableCell className="text-center">{client.id}</TableCell>
                <TableCell className="text-center">{client.customer.name}</TableCell>
                <TableCell className="text-center"><Link href={'/cards/'+client.id}>{client.card?.length || 0}</Link></TableCell>
                <TableCell className="text-center">{client.isOne ? "نعم" : "لا"}</TableCell>
                <TableCell className="text-center">{client.isTow ? "نعم" : "لا"}</TableCell>
                <TableCell className="text-center">{client.isThree ? "نعم" : "لا"}</TableCell>
                <TableCell className="text-center">{client.isFoure ? "نعم" : "لا"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}

    </div>
    </Suspense>
  );
}
