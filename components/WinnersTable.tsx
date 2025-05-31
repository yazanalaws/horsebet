"use client";

import React, { useEffect, useState } from "react";

interface HorseData {
  horseId: number;
  name: string;
  startsWith: number;
  endsWith: number;
  price: number;
  take: number;
}

interface LevelData {
  levelId: number;
  levelName: string;
  horses: HorseData[];
  cash: number;
  totalForcast: number;
  totalForcastWins : number
}
interface Props  {
  matchId: number;
  discount : number
}
export default function WinnersTable({ matchId , discount }:Props ) {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cash, setCash] = useState(0);

  useEffect(() => {
    async function fetchWinners() {
      const res = await fetch("/api/horses/start", {
        method: "POST",
        body: JSON.stringify({ matchId }),
      });

      const data = await res.json();

      const updatedLevels: LevelData[] = data.data.map((level: LevelData) => {
        const levelCash = level.horses.reduce(
          (sum, horse) => sum + horse.endsWith,
          0
        );
        return {
          ...level,
          cash: levelCash,
        };
      });

      setLevels(updatedLevels);
      setLoading(false);
    }

    if (matchId) {
      fetchWinners();
    }
  }, [matchId]);

  if (loading) return <p className="text-center p-4">Loading...</p>;

  return (
    <div className="space-y-8">
      {levels.map((level) => (
        <div
          key={level.levelId}
          className="border rounded shadow p-4"
          dir="rtl"
        >
          <h2 className="text-xl font-semibold mb-4">{level.levelName}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border">
              <thead>
                <tr>
                  <th className="border p-2">إحصائيات</th>
                  {level.horses.map((horse) => (
                    <th key={horse.horseId} className="border p-2 text-center">
                      {horse.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-medium">يبدأ</td>
                  {level.horses.map((horse) => (
                    <td key={horse.horseId} className="border p-2 text-center">
                      {horse.startsWith}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border p-2 font-medium">ينتهي</td>
                  {level.horses.map((horse) => (
                    <td key={horse.horseId} className="border p-2 text-center">
                      {horse.endsWith}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border p-2 font-medium">السعر</td>
                  {level.horses.map((horse) => (
                    <td key={horse.horseId} className="border p-2 text-center">
                      {horse.price}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border p-2 font-medium">يأخذ</td>
                  {level.horses.map((horse) => (
                    <td key={horse.horseId} className="border p-2 text-center">
                      {horse.take.toFixed(1)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div className="mt-4 text-right">

                <p className="text-lg font-bold">
                 صندوق {level.levelName} : {level.cash}
                </p>

            </div>
            <div className="mt-4 mb-4 text-right">

                <p className="text-lg font-bold">
                  إجمالي الكاش: {level.cash * discount}
                </p>

            </div>
            <hr></hr>
            <div className="mt-4 text-right">

                <p className="text-lg font-bold">
                 اجمالي فوركست {level.levelName} : {Number(level.totalForcast)}
                </p>

            </div>
             <div className="mt-4 text-right">

                <p className="text-lg font-bold">
                 اجمالي الفوركست الرابحة {level.levelName} : {Number(level.totalForcastWins)}
                </p>

            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
