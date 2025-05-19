"use client";
import React, { useState } from "react";
import Cookies from "js-cookie";
interface Props {
  setMatchId: React.Dispatch<React.SetStateAction<number | null>>
}
export default function NewMatch({setMatchId} : Props) {
  const defaultName = new Date().toLocaleDateString('en-GB')
  const [matchName, setMatchName] = useState(defaultName);
  const [descount , setDescount] = useState('')
  const [levelsCount, setLevelsCount] = useState<string>("");
  const username = Cookies.get("username");
  const createMatch = async () => {
    const res = await fetch("/api/match/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ matchName, levelsCount, username , descount }),
    });
    if (res.ok) {
      const data = await res.json();
      setMatchId(data.matchId)
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center ">
      <div className="flex flex-col p-4  gap-4 rounded bg-white text-black w-[100%] max-w-[300px] h-auto ">
        <p className="text-center font-bold">إبدأ حفلة جديدة</p>

        <div className="w-full flex flex-col gap-2 justify-end">
          <p className="text-right">اسم الحفلة</p>
          <div className="flex justify-end rounded py-0.5 bg-[#f8f8f8] shadow">
            <input
              required
              value={matchName}
              onChange={(e) => setMatchName(e.target.value)}
              type="text"
              className="w-full px-0.5 text-right border-none outline-none"
              placeholder=""
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-2 justify-end">
          <p className="text-right">عدد الأشواط </p>
          <div className="flex justify-end rounded py-0.5 bg-[#f4f4f4] shadow">
            <input
              required
              value={levelsCount}
              onChange={(e) => setLevelsCount(e.target.value)}
              type="number"
              className="w-full px-0.5 text-right border-none outline-none"
              placeholder="eg : 6"
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-2 justify-end">
          <p className="text-right">نسبة الخصم</p>
          <div className="flex justify-end rounded py-0.5 bg-[#f8f8f8] shadow">
            <input
              required
              value={descount}
              inputMode='decimal'
              onChange={(e) => setDescount(e.target.value)}
              type="text"
              className="w-full px-0.5 text-right border-none outline-none"
              placeholder="مثال : 0.80"
            />
          </div>
        </div>
        <button
          onClick={createMatch}
          type="button"
          className="p-0.5 shadow bg-green-600 text-white rounded mb-2"
        >
          ابدا الحفلة
        </button>
      </div>
    </div>
  );
}
