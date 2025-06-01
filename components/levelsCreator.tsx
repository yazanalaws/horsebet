"use client";
import { levels } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import Cookies from "js-cookie";

interface Props {
  matchId: number;
  setLevelsCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

type Horse = {
  name: string;
  price: number;
};

type LevelWithHorses = levels & {
  horses: Horse[];
};

export default function LevelsCreator({ matchId, setLevelsCreated }: Props) {
  const [levels, setLevels] = useState<LevelWithHorses[] | null>(null);

  useEffect(() => {
    const fetchLevels = async () => {
      const res = await fetch("/api/match/levels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matchId }),
      });
      if (res.ok) {
        const data = await res.json();
        const levelsWithHorses = data.levels.map((level: levels) => ({
          ...level,
          horses: [],
        }));
        setLevels(levelsWithHorses);
      }
    };

    if (matchId) {
      fetchLevels();
    }
  }, [matchId]);

  const addHorse = (levelId: number) => {
    setLevels(
      (prev) =>
        prev?.map((level) =>
          level.id === levelId
            ? {
                ...level,
                horses: [...level.horses, { name: "", price: 0 }],
              }
            : level
        ) || null
    );
  };

  const updateHorse = (
    levelId: number,
    index: number,
    field: "name" | "price",
    value: string | number
  ) => {
    setLevels(
      (prev) =>
        prev?.map((level) =>
          level.id === levelId
            ? {
                ...level,
                horses: level.horses.map((horse, i) =>
                  i === index
                    ? {
                        ...horse,
                        [field]: field === "price" ? Number(value) : value,
                      }
                    : horse
                ),
              }
            : level
        ) || null
    );
  };

  const removeHorse = (levelId: number, index: number) => {
    setLevels(
      (prev) =>
        prev?.map((level) =>
          level.id === levelId
            ? {
                ...level,
                horses: level.horses.filter((_, i) => i !== index),
              }
            : level
        ) || null
    );
  };

  const createLevelHorses = async () => {
    if (!levels) return;

    const payload = levels.flatMap((level) =>
      level.horses.map((horse) => ({
        matchId,
        level_id: level.id, // add this
        name: horse.name.trim(),
        price: parseFloat(horse.price.toString()),
      }))
    );

    const username = Cookies.get("username");
    // Optionally validate
    const invalid = payload.find(
      (h) => !h.name || isNaN(h.price) || h.price < 0
    );
    if (invalid) {
      alert("Please enter valid horse names and prices for all horses.");
      return;
    }

    try {
      const res = await fetch("/api/horses/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ horses: payload, username: username }),
      });

      if (!res.ok) throw new Error("Failed to submit horses.");
      setLevelsCreated(true);
      alert("Horses successfully saved.");
    } catch (err) {
      console.error(err);
      alert("Error saving horses.");
    }
  };
  const updateLevel = async (levelId: number, forcastPrice: string) => {
    try {
      setLevels((prev) =>
        prev
          ? prev.map((lvl) =>
              lvl.id === levelId
                ? {
                    ...lvl,
                    forcastPrice: forcastPrice, // Ensure it's a number
                  }
                : lvl
            )
          : prev
      );
      const res = await fetch("/api/level/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ levelId, forcastPrice }),
      });

      if (!res.ok) throw new Error("Failed to update level.");
      //alert("Level successfully updated.");
    } catch (err) {
      console.error(err);
      //alert("Error updating level.");
    }
  };

  return (
    <div className="w-[95%] h-auto flex mt-[100px] gap-4 mx-auto flex-row-reverse justify-center flex-wrap">
      {levels &&
        levels.map((level, index) => (
          <div
            id={`level_${level.id}`}
            className="w-[240px] bg-white rounded p-2 shadow-sm text-black h-auto flex flex-col"
            key={index}
          >
            <p className="text-sm text-center font-bold">{level.name}</p>

            {level.horses.map((horse, i) => (
              <div
                key={i}
                className="flex flex-row-reverse gap-2 justify-between items-center mt-2"
              >
                <input
                  type="text"
                  className="w-[90px] outline-none border-none shadow text-right"
                  placeholder="اسم الحصان"
                  value={horse.name}
                  onChange={(e) =>
                    updateHorse(level.id, i, "name", e.target.value)
                  }
                />
                <input
                  type="number"
                  inputMode="decimal"
                  className="w-[90px] outline-none border-none shadow text-right"
                  placeholder="السعر المبدئي"
                  value={1.0}
                  onChange={(e) =>
                    updateHorse(level.id, i, "price", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="p-1 rounded bg-red-600 text-white"
                  onClick={() => removeHorse(level.id, i)}
                >
                  <MdDelete />
                </button>
              </div>
            ))}
            <div className="w-full flex justify-between items-center mt-2">
              <input
                type="number"
                inputMode="decimal"
                className="w-[90px] outline-none border-none shadow text-right"
                placeholder="سعر الفوركست"
                value={level.forcastPrice}
                onChange={(e) => updateLevel(level.id, e.target.value)}
              />
              <p className="text-sm">سعر الفوركست</p>
            </div>
            <button
              type="button"
              onClick={() => addHorse(level.id)}
              className="bg-green-500 text-white rounded m-2"
            >
              حصان جديد
            </button>
          </div>
        ))}

      {/* Submit button */}
      <div className="w-full flex justify-center mt-4">
        <button
          type="button"
          onClick={createLevelHorses}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          حفظ الخيول
        </button>
      </div>
    </div>
  );
}
