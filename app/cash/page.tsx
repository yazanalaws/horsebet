"use client"
import WinnersTable from "@/components/WinnersTable";
import React, { useEffect, useState } from "react";
interface matchData {
  betCount: number;
  total: number;
  cash: number;
  matchCardsCount: number;
  discount: number;
}
export default function page() {
  const [matchData, setMatchData] = useState<matchData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getMatchData = async () => {
      const res = await fetch("/api/cash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMatchData(data.data);
        setLoading(false)
      }
    };
    if (!matchData) {
      getMatchData();
    }
  }, [matchData]);
  return (
    <div className="w-[95%] m-auto flex flex-col gap-8 min-h-screen h-auto mt-[90px] text-white text-lg">
      {loading && !matchData ? (
        <div className="flex flex-wrap gap-1 flex-row-reverse">
          <div className="flex-[calc(1/4*100%-4px)]">
            <div className="w-full p-1 h-32 flex flex-col gap-4 skel text-black rounded text-right">

            </div>
          </div>
          <div className="flex-[calc(1/4*100%-4px)]">
            <div className="w-full p-1 h-32 flex flex-col gap-4 skel text-black rounded text-right">

            </div>
          </div>
          <div className="flex-[calc(1/4*100%-4px)]">
            <div className="w-full p-1 h-32 flex flex-col gap-4 skel text-black rounded text-right">

            </div>
          </div>
          <div className="flex-[calc(1/4*100%-4px)]">
            <div className="w-full p-1 h-32 flex flex-col gap-4 skel  text-black rounded text-right">

            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1 flex-row-reverse">
          <div className="flex-[calc(1/4*100%-4px)]">
            <div className="w-full p-1 h-32 flex flex-col gap-4 bg-white text-black rounded text-right">
              <h1>عدد الرهانات</h1>
              <p className="text-center text-2xl font-bold">{matchData?.betCount}</p>
            </div>
          </div>
          <div className="flex-[calc(1/4*100%-4px)]">
            <div className="w-full p-1 h-32 flex flex-col gap-4 bg-white text-black rounded text-right">
              <h1>عدد الأوراق</h1>
              <p className="text-center text-2xl font-bold">{matchData?.matchCardsCount}</p>
            </div>
          </div>
          <div className="flex-[calc(1/4*100%-4px)]">
            <div className="w-full p-1 h-32 flex flex-col gap-4 bg-white text-black rounded text-right">
              <h1> صندوق</h1>
              <p className="text-center text-2xl font-bold">{matchData?.total}</p>
            </div>
          </div>
          <div className="flex-[calc(1/4*100%-4px)]">
            <div className="w-full p-1 h-32 flex flex-col gap-4 bg-white text-black rounded text-right">
              <h1> كاش</h1>
              <p className="text-center text-2xl font-bold">{matchData?.cash}</p>
            </div>
          </div>
        </div>
      )}
      <hr className="w-full" />
      <div className="flex flex-col">
        <WinnersTable matchId={15} discount={Number(matchData?.discount)} />
      </div>
    </div>
  );
}
