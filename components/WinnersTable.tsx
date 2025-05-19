'use client';

import React, { useEffect, useState } from 'react';

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
}

export default function WinnersTable({ matchId }: { matchId: number }) {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWinners() {
      const res = await fetch('/api/horses/start', {
        method: 'POST',
        body: JSON.stringify({ matchId }),
      });

      const data = await res.json();
      setLevels(data.data);
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
        <div key={level.levelId} className="border rounded shadow p-4" dir='rtl'>
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
          </div>
        </div>
      ))}
    </div>
  );
}
