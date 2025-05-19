"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { matchStatus } from "@prisma/client";

interface Combs {
  success: boolean;
  headers: string[];
  data: any[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface LevelData {
  name: string;
  winner: boolean;
  status: matchStatus;
}

export default function Page() {
  const [combs, setCombs] = useState<Combs | null>(null);
  const [levelKeys, setLevelKeys] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [allCombs, setAllCombs] = useState<Combs | null>(null);
  const [winers, setWiners] = useState(false);
  const sortedData = useMemo(() => {
    if (!combs || !combs.data) return [];
    if (!sortConfig) return combs.data;
    return [...combs.data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Handle nested objects for sorting
      const aCompare = typeof aVal === "object" ? aVal.name : aVal;
      const bCompare = typeof bVal === "object" ? bVal.name : bVal;

      if (aCompare < bCompare) return sortConfig.direction === "asc" ? -1 : 1;
      if (aCompare > bCompare) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [combs?.data, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };
  const getWinnersOnly = async  () => {
    setPageSize(200)
    setWiners(true)
  }
  const fetchCombs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cards/combo/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: currentPage,
          pageSize: pageSize,
          customerName: searchTerm,
          winers: winers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCombs(data);
        // Extract level keys from the first data item (if available)
        if (data.data && data.data.length > 0) {
          const keys = Object.keys(data.data[0])
            .filter((key) => key.startsWith("level_"))
            .sort((a, b) => {
              // Sort by the numeric part of the level ID
              const numA = parseInt(a.split("_")[1]);
              const numB = parseInt(b.split("_")[1]);
              return numA - numB;
            });
          setLevelKeys(keys);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCombs();
  }, [currentPage, pageSize, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCombs();
  };

  const totalPages = combs ? Math.ceil(combs.pagination.total / pageSize) : 0;
  return (
    <div
      className="w-[95%] m-auto h-auto min-h-screen mt-[60px] flex flex-col text-white text-lg"
      dir="rtl"
    >
      <div className="flex gap-3  mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="ابحث باسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 text-right bg-white text-black rounded"
          />
          <button type="submit" disabled={isLoading}>
            بحث
          </button>
        </form>
        <div className="flex gap-2 justify-center items-center">
          <p>عرض الرابحين فقط</p>
          <input type="checkbox" onChange={(e)  => {
                  if(e.target.checked){
                 getWinnersOnly().then().finally(fetchCombs)
                }else{
                    setWiners(false)
                    setCurrentPage(1)
                    setSearchTerm('')
                    setPageSize(10)
                    fetchCombs()
                }


            }} />
        </div>


        <div className="flex items-center gap-2 mr-auto">
          <span>عدد العناصر:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-gray-800 text-white p-1 rounded"
          >
            {[10, 20, 50, 100 , 200].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>جاري التحميل...</p>
        </div>
      ) : combs ? (
        <>
          <Table>
            <TableCaption>قائمة الاحتمالات المرتبطة بالظريف</TableCaption>
            <TableHeader className="bg-gray-500">
              <TableRow>
                {/* Reverse the headers to show ID on the right */}
                {combs.headers.map((header, index) => (
                  <TableHead
                    className="text-white text-center cursor-pointer hover:bg-gray-600"
                    key={index}
                    onClick={() =>
                      handleSort(
                        header === "id"
                          ? "id"
                          : header === "الظريف"
                          ? "customer"
                          : header === "الحالة"
                          ? "rowStatus"
                          : header
                      )
                    }
                  >
                    {header}
                    {sortConfig?.key ===
                      (header === "id"
                        ? "id"
                        : header === "الظريف"
                        ? "customer"
                        : header === "الحالة"
                        ? "rowStatus"
                        : header) && (
                      <span>
                        {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </TableHead>
                ))}
                <TableHead className="text-white text-center cursor-pointer hover:bg-gray-600">
                  <span>الأرباح</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData
                .slice()
                .reverse()
                .map((row) => (
                  <TableRow key={row.id}>
                    {/* Status cell (first column) */}
                    <TableCell className="text-center">{row.id}</TableCell>
                    <TableCell className="text-center">
                      {row.customer}
                    </TableCell>
                    {/* Level cells (middle columns) */}
                    {levelKeys.map((levelKey) => {
                      const cellData = row[levelKey];

                      if (cellData === "-") {
                        return (
                          <TableCell className="text-center" key={levelKey}>
                            -
                          </TableCell>
                        );
                      }

                      if (typeof cellData === "object") {
                        return (
                          <TableCell
                            className={`text-center ${
                              cellData.winner &&
                              cellData.status === matchStatus.ENDED
                                ? "bg-green-700 text-white font-bold"
                                : !cellData.winner &&
                                  cellData.status === matchStatus.ENDED
                                ? "bg-red-700 text-white"
                                : ""
                            }`}
                            key={levelKey}
                          >
                            {cellData.name}
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell className="text-center" key={levelKey}>
                          -
                        </TableCell>
                      );
                    })}

                    {/* Customer cell */}

                    {/* ID cell (last column) */}

                    <TableCell className="text-center">
                      {row.rowStatus === "يربح" ? (
                        <span className="bg-green-700 text-white font-bold px-2 py-1 rounded">
                          {row.rowStatus}
                        </span>
                      ) : row.rowStatus === "يخسر" ? (
                        <span className="bg-red-700 text-white px-2 py-1 rounded">
                          {row.rowStatus}
                        </span>
                      ) : (
                        <span
                          className="bg-orange-500 text-white px-2 py-1 rounded cursor-pointer"
                          title="تظهر النتائج عندما يتم انهاء جميع الاشواط"
                        >
                          {row.rowStatus}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.horsesPrice}
                    </TableCell>
                    <TableCell className="text-center">{row.amount}</TableCell>
                    <TableCell className="text-center">
                      {row.rowStatus === "يربح" ? (
                        <>
                          {row.horsesPrice == 1
                            ? Number(row.amount) * row.horsesPrice * 0.8
                            : (Number(row.amount) * row.horsesPrice).toFixed(1)}
                        </>
                      ) : (
                        <>0</>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <div>
              <span>
                الصفحة {currentPage} من {totalPages} (إجمالي{" "}
                {combs.pagination.total} عنصر)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
              >
                السابق
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || isLoading}
              >
                التالي
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p>لا توجد بيانات متاحة</p>
        </div>
      )}
    </div>
  );
}
