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
import { client } from "../types";
import Link from "next/link";
import NewClient from "@/components/newClient";

export default function Page() {
  const [clients, setClients] = useState<client[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClient , setNewClient] = useState(false)
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/clients", {
          method: "POST",
        });
        const data = await res.json();
        if (data.success) {
          setClients(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);
  const removeClient = async (id : number) => {
    const res = await fetch('/api/clients/delete' , {
       method :  'POST',
       headers : {
        'Content-Type' : 'application/json'
       },
       body : JSON.stringify({
        id  : id
       })
    })
    if(res.ok){
      window.location.reload()
    }
  }
  return (
    <div className="w-[95%] m-auto h-screen mt-[60px] flex flex-col text-white text-lg">
      <button onClick={() => setNewClient(true)} className="px-2 py-1 bg-green-700 text-white rounded ml-auto">ظريف جديد</button>
      <Table>
        <TableCaption>قائمة العملاء والمراهنات الخاصة بهم</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white text-center"> خيارات </TableHead>
          <TableHead className="text-white text-center"> احتمالات الربح</TableHead>
            <TableHead className="text-white text-center">حسابات الظريف</TableHead>
            <TableHead className="text-white text-center">
              عدد الرهانات
            </TableHead>
            <TableHead className="text-white text-center">أنشئ بواسطة</TableHead>
            <TableHead className="text-white text-center">الاسم</TableHead>
            <TableHead className="text-white text-center">ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                جارٍ التحميل...
              </TableCell>
            </TableRow>
          ) : clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                لا يوجد عملاء.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="text-center"><button onClick={() => removeClient(client.id)} className="px-2 py-1 rounded bg-red-600 text-white"> حذف الظريف </button></TableCell>
                 <TableCell className="text-center"><Link href={'/comb/' +client.id + ''} className="px-2 py-1 rounded bg-green-600 text-white">عرض جميع الاحتمالات</Link></TableCell>

                <TableCell className="text-center"><Link href={'/client/' +client.id + '/cash'} className="px-2 py-1 rounded bg-green-600 text-white">عرض الحسابات</Link></TableCell>
                <TableCell className="text-center"><Link href={'/client/' +client.id}>{client.betCount}</Link></TableCell>
                <TableCell className="text-center">{client.madeBy}</TableCell>
                <TableCell className="text-center">{client.name}</TableCell>
                <TableCell className="text-center">{client.id}</TableCell>

              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {newClient &&
        <NewClient setNewClient={setNewClient}/>
      }
    </div>
  );
}
