"use client"
import React, { use, useEffect, useState } from "react";

interface PageProps {
  params: Promise<{ id: number }>;
}

interface data {
  clientName: string;
  totalAmmount: number;
  netTotal: number;
  winTotal: number;
  matchName: string;
}
import { Suspense } from 'react'
export default function Page({ params }: PageProps) {
  const { id } = use(params);
  const [cLientData, setClientData] = useState<data | null>(null);
  const [back, setBack] = useState("0");
  const [tip, setTip] = useState("0");
  const [backPrecent, setBackPercent] = useState("");
  const [profits, setProfits] = useState("0");
  const [originalProfits, setOriginalProfits] = useState(0);
  const [lose , setLose] = useState('')

  useEffect(() => {
    const fetchCash = async () => {
      const res = await fetch("/api/clients/cash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(id),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setClientData(data);

        const baseProfit = Number((data.netTotal - data.winTotal).toFixed(1));
        if (baseProfit > 1) {
          setOriginalProfits(baseProfit);
          setProfits(baseProfit.toString());
        } else {
          setOriginalProfits(0);
          setProfits("0");
        }
      }
    };

    if (id && !cLientData) {
      fetchCash();
    }
  }, [id, cLientData]);

  useEffect(() => {
    const backPercentValue = parseFloat(backPrecent) || 0;
    const tipValue = parseFloat(tip) || 0;

    const backAmount = (originalProfits * backPercentValue) / 100;
    setBack(backAmount.toFixed(1));


    const newProfits = originalProfits - backAmount - tipValue;
    setProfits(newProfits > 0 ? newProfits.toFixed(1) : "0");
  }, [backPrecent, tip, originalProfits]);

  return (
    <Suspense>
    <div className="w-[95%] m-auto h-screen mt-[60px] text-white text-lg" dir="rtl">
      {cLientData && (
        <div className="flex flex-col gap-4">
          <h1 className="font-bold text-lg">
            حسابات {cLientData.clientName} {cLientData.matchName}
          </h1>

          <div className="flex items-center gap-4">
            <p className="font-bold w-[200px]">مجموع اللعب:</p>
            <input
              type="text"
              disabled
              readOnly
              value={cLientData.totalAmmount}
              className="p-2 rounded text-black bg-white"
            />
          </div>

          <div className="flex items-center gap-4">
            <p className="font-bold w-[200px]">صافي:</p>
            <input
              type="text"
              disabled
              readOnly
              value={cLientData.netTotal}
              className="p-2 rounded text-black bg-white"
            />
          </div>

          <div className="flex items-center gap-4">
            <p className="font-bold w-[200px]">إصابة:</p>
            <input
              type="text"
              disabled
              readOnly
              value={cLientData.winTotal}
              className="p-2 rounded text-black bg-white"
            />
          </div>

          <div className="flex items-center gap-4">
            <p className="font-bold w-[200px]">لنا / لكم:</p>
            <div className="flex items-center gap-4">
              <input
                type="text"
                disabled
                readOnly
                value={
                  Number((cLientData.netTotal - cLientData.winTotal).toFixed(1)) > 1
                    ? (cLientData.netTotal - cLientData.winTotal).toFixed(1)
                    : 0
                }
                className="p-2 rounded text-black bg-white"
              />
              <input
                type="text"
                disabled
                readOnly
                value={cLientData.winTotal}
                className="p-2 rounded text-black bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="font-bold w-[200px]">رجعة:</p>
            <input
              type="number"
              value={backPrecent}
              placeholder="نسبة مئوية"
              onChange={(e) => setBackPercent(e.target.value)}
              className="p-2 rounded text-black bg-white"
            />
            <input
              type="number"
              value={back}
              readOnly
              className="p-2 rounded text-black bg-white"
            />
          </div>

          <div className="flex items-center gap-4">
            <p className="font-bold w-[200px]">إكرامية:</p>
            <input
              type="number"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              className="p-2 rounded text-black bg-white"
            />
          </div>

          <div className="flex items-center gap-4">
            <p className="font-bold w-[200px]">لنا صافي:</p>
            <input
              type="number"
              value={profits}
              readOnly
              className="p-2 rounded text-black bg-white"
            />
          </div>
          <div className="flex items-center gap-4">
            <p className="font-bold w-[200px]">لكم صافي:</p>
            <input
              type="number"
              value={lose}
              readOnly
              className="p-2 rounded text-black bg-white"
            />
          </div>
        </div>
      )}
    </div>
    </Suspense>
  );
}
