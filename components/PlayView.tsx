import { client, levelData } from "@/app/types";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { matchStatus } from "@prisma/client";
import { toast } from "sonner";

export interface bet {
  clientId: number;
  isOne: boolean;
  isTow: boolean;
  isThree: boolean;
  isFoure: boolean;
  isForcast: boolean;
  horses:
    | {
        horseId: number;
        levelId: number;
      }[]
    | null;
  forcastHorses: {
    levelId: number;
    firstHorseId: number;
    secondHorseId: number;
  } | null;
  ammount: number;
}

interface Props {
  matchId: number;
}

export default function PlayView({ matchId }: Props) {
  const [winners, setWinners] = useState({ first: 0, second: 0 });
  const [ammount, setAmmount] = useState("");
  const [horses, setHorses] = useState<levelData[] | null>(null);
  const [selectedModes, setSelectedModes] = useState<number[]>([]);
  const [selectedHorses, setSelectedHorses] = useState<Record<number, any>>({});
  const [betMode, setBetMode] = useState(false);
  const [clients, setClients] = useState<client[]>([]);
  const username = Cookies.get("username");
  const [betSelection, setBetSelection] = useState<
    { id: number; name: string; levelId: number }[]
  >([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectingWinnersForLevel, setSelectingWinnersForLevel] = useState<number | null>(null);

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
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { levelId, status, firstWinnerId, secondWinnerId } = data;

        setHorses((prev) =>
          prev
            ? prev.map((lvl) =>
                lvl.levelId === levelId
                  ? {
                      ...lvl,
                      status,
                      firstWinnerId,
                      secondWinnerId
                    }
                  : lvl
              )
            : prev
        );
      } catch (err) {
        console.error("Invalid SSE message:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const fetchMatchHorses = async () => {
      const res = await fetch("/api/playground", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matchId }),
      });
      if (res.ok) {
        const data = await res.json();
        setHorses(data.levelsData);
      }
    };
    if (matchId && !horses) {
      fetchMatchHorses();
    }
  }, [matchId, horses]);

  const maxSelections =
    selectedModes.length > 0 ? Math.max(...selectedModes) : 0;

  const toggleMode = (val: number) => {
    const updated = selectedModes.includes(val)
      ? selectedModes.filter((v) => v !== val)
      : [...selectedModes, val];
    setSelectedModes(updated);
    setBetMode(false);
    setBetSelection([]);
  };

  const handleBetToggle = () => {
    setBetMode(!betMode);
    setSelectedModes([]);
    setSelectedHorses({});
    setBetSelection([]);
  };

  const handleHorseClick = (
    levelId: number,
    horseId: number,
    horseName: string
  ) => {
    if (selectingWinnersForLevel === levelId) {
      if (!winners.first) {
        setWinners({...winners, first: horseId});
      } else if (!winners.second && horseId !== winners.first) {
        setWinners({...winners, second: horseId});
      } else if (winners.first === horseId) {
        setWinners({...winners, first: winners.second, second: 0});
      } else if (winners.second === horseId) {
        setWinners({...winners, second: 0});
      }
      return;
    }

    if (betMode) {
      const alreadySelected = betSelection.find((h) => h.id === horseId);
      if (alreadySelected) {
        const updated = betSelection.filter((h) => h.id !== horseId);
        setBetSelection(updated);
        return;
      }

      if (betSelection.length > 0 && betSelection[0].levelId !== levelId) {
        alert("In bet mode, both horses must be from the same level.");
        return;
      }

      if (betSelection.length >= 2) {
        alert("Only two horses can be selected in bet mode.");
        return;
      }

      const newSelection = [
        ...betSelection,
        { id: horseId, name: horseName, levelId },
      ];
      setBetSelection(newSelection);
    } else {
      if (selectedHorses[levelId]?.[horseName] === horseId) {
        const updated = { ...selectedHorses };
        delete updated[levelId];
        setSelectedHorses(updated);
        return;
      }
      setSelectedHorses({
        ...selectedHorses,
        [levelId]: { [horseName]: horseId },
      });
    }
  };

  const buildBetObject = (): bet | null => {
    if (!selectedClientId) {
      alert("يرجى اختيار الظريف");
      return null;
    }

    if (betMode) {
      if (betSelection.length !== 2) {
        alert("يرجى اختيار حصانين للفوركست");
        return null;
      }
      return {
        clientId: selectedClientId,
        isOne: false,
        isTow: false,
        isThree: false,
        isFoure: false,
        isForcast: true,
        horses: null,
        forcastHorses: {
          levelId: betSelection[0].levelId,
          firstHorseId: betSelection[0].id,
          secondHorseId: betSelection[1].id,
        },
        ammount: Number(ammount),
      };
    } else {
      const horsesArray: { horseId: number; levelId: number }[] =
        Object.entries(selectedHorses).map(([levelId, horseObj]) => {
          const horseName = Object.keys(horseObj)[0];
          return {
            horseId: horseObj[horseName],
            levelId: parseInt(levelId),
          };
        });

      return {
        clientId: selectedClientId,
        isOne: selectedModes.includes(1),
        isTow: selectedModes.includes(3),
        isThree: selectedModes.includes(4),
        isFoure: selectedModes.includes(5),
        isForcast: false,
        horses: horsesArray,
        forcastHorses: null,
        ammount: Number(ammount),
      };
    }
  };

  const submitBet = async () => {
    const betData = buildBetObject();
    if (!betData) return;
    if(!betData.isForcast && !betData.horses){
      toast.error("يجب اختيار حصان واحد على الاقل!");
      return
    }
    if(!selectedClientId){
      toast.error("الرجاء اختيار اسم الظريف قبل المتابعة")
      return
    }
    if(ammount.length < 1){
      toast.error('يرجى تحديد المبلغ قبل المتابعة')
      return
    }
    if(!betData.isForcast && !betData.isTow && !betData.isOne && !betData.isThree && !betData.isFoure){
      toast.error('الرجاء اختيار نوع الورقة')
      return
    }
    try {
      const res = await fetch("/api/bets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bet: betData, username: username , matchId : matchId}),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("تم إرسال الرهان بنجاح!");
        setSelectedModes([]);
        setSelectedHorses({});
        setBetMode(false);
        setBetSelection([]);
      } else {
        toast.error("فشل في إرسال الرهان.");
      }
    } catch (err) {
      console.error("Error submitting bet:", err);
      toast.error("حدث خطأ أثناء إرسال الرهان.");
    }
  };

  const updateStatus = async (levelId: number, status: matchStatus) => {
    const res = await fetch("/api/level/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ levelId, status }),
    });
    if(status == matchStatus.ENDED){
      setSelectingWinnersForLevel(levelId)
    }
  };

  const saveWinners = async (levelId: number) => {
    if (!winners.first || !winners.second) {
      toast.error("الرجاء اختيار الحصانين الفائزين");
      return;
    }

    try {
      const res = await fetch("/api/level/winners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          levelId,
          firstHorseId: winners.first,
          secondHorseId: winners.second
        }),
      });

      if (res.ok) {
        toast.success("تم حفظ الفائزين بنجاح");
        setSelectingWinnersForLevel(null);
        setWinners({first: 0, second: 0});
      } else {
        toast.error("فشل في حفظ الفائزين");
      }
    } catch (err) {
      console.error("Error saving winners:", err);
      toast.error("حدث خطأ أثناء حفظ الفائزين");
    }
  };

  return (
    <div className="w-[98%] mt-[70px] flex flex-col items-center">
      <div className="w-full flex flex-wrap flex-row-reverse justify-center gap-4">
        {horses?.map((level) => (
          <div key={level.levelId} className="w-[150px] bg-white rounded p-2 shadow text-black">
            <p className="text-sm text-center font-bold mb-2">
              {level.levelName}
            </p>

            {level.status === matchStatus.ENDED && !selectingWinnersForLevel && (
              <p className="text-[12px] mb-2 text-center text-red-700">
                {level.firstWinnerId && level.secondWinnerId
                  ? "تم اختيار الفائزين"
                  : "الرجاء تحديد الخيول الرابحة"}
              </p>
            )}

            {level.horses.map((horse) => {
              const isSelectedInBet = betSelection.find(h => h.id === horse.id);
              const isFirstBet = betSelection[0]?.id === horse.id;
              const isSecondBet = betSelection[1]?.id === horse.id;
              const isRegularSelected = selectedHorses[level.levelId]?.[horse.name] === horse.id;
              const isFirstWinner = selectingWinnersForLevel === level.levelId && winners.first === horse.id;
              const isSecondWinner = selectingWinnersForLevel === level.levelId && winners.second === horse.id;
              const isSavedWinner = level.firstWinnerId === horse.id || level.secondWinnerId === horse.id;

              return (
                <button
                  key={horse.id}
                  className={`w-full mb-2 py-1 px-2 rounded text-left ${
                    betMode
                      ? isFirstBet
                        ? "bg-yellow-400 text-white"
                        : isSecondBet
                        ? "bg-gray-400 text-white"
                        : isSelectedInBet
                        ? "bg-green-600 text-white"
                        : "bg-gray-100"
                      : isRegularSelected
                      ? "bg-green-600 text-white"
                      : selectingWinnersForLevel === level.levelId
                      ? isFirstWinner
                        ? "bg-yellow-400 text-white"
                        : isSecondWinner
                        ? "bg-gray-400 text-white"
                        : "bg-gray-100"
                      : isSavedWinner
                      ? level.firstWinnerId === horse.id
                        ? "bg-yellow-400 text-white"
                        : "bg-gray-400 text-white"
                      : "bg-gray-100"
                  }`}
                  onClick={() => {
                    if (level.status === matchStatus.PENDING) {
                      handleHorseClick(level.levelId, horse.id, horse.name);
                    } else if (selectingWinnersForLevel === level.levelId) {
                      handleHorseClick(level.levelId, horse.id, horse.name);
                    } else {
                      if (level.status === matchStatus.STARTED) {
                        toast("هذا الشوط قد بدأ بالفعل");
                      }
                      if (level.status === matchStatus.ENDED) {
                        toast("هذا الشوط قد انتهى");
                      }
                    }
                  }}
                >
                  {horse.name}
                </button>
              );
            })}

            <button
              onClick={async () => {
                if (level.status === matchStatus.ENDED && selectingWinnersForLevel !== level.levelId) {
                  // Start selecting winners for this level
                  setSelectingWinnersForLevel(level.levelId);
                  setWinners({first: 0, second: 0});
                  return;
                }

                if (selectingWinnersForLevel === level.levelId) {
                  if (winners.first && winners.second) {
                    await saveWinners(level.levelId);
                  } else {
                    toast.error("الرجاء اختيار الحصانين الفائزين");
                  }
                  return;
                }

                // Original status change logic
                const newStatus =
                  level.status === matchStatus.PENDING
                    ? matchStatus.STARTED
                    : level.status === matchStatus.STARTED
                    ? matchStatus.ENDED
                    : null;

                if (newStatus) {
                  await updateStatus(level.levelId, newStatus);
                  setHorses(prev =>
                    prev
                      ? prev.map(lvl =>
                          lvl.levelId === level.levelId
                            ? { ...lvl, status: newStatus }
                            : lvl
                        )
                      : prev
                  );
                  toast.success(
                    newStatus === matchStatus.STARTED
                      ? "تم بدء الشوط"
                      : "تم إنهاء الشوط"
                  );
                }
              }}
              style={{
                background:
                  selectingWinnersForLevel === level.levelId
                    ? winners.first && winners.second
                      ? "blue"
                      : "orange"
                    : level.status === matchStatus.PENDING
                    ? "green"
                    : level.status === matchStatus.STARTED
                    ? "red"
                    : "gray",
              }}
              className="rounded w-full py-1 text-white"
              disabled={level.status === matchStatus.ENDED &&
                        !selectingWinnersForLevel &&
                        (!level.firstWinnerId || !level.secondWinnerId)}
            >
              {selectingWinnersForLevel === level.levelId
                ? winners.first && winners.second
                  ? "حفظ الفائزين"
                  : "اختر الفائزين"
                : level.status === matchStatus.PENDING
                ? "إبدا الشوط"
                : level.status === matchStatus.STARTED
                ? "إنهاء الشوط"
                : "منتهي"}
            </button>
          </div>
        ))}
      </div>

      <div className="w-full flex flex-col">
        <div className="flex flex-row-reverse gap-4 mt-10 mb-6 flex-wrap">
          {[
            { val: 1, label: "ورقة واحدة" },
            { val: 3, label: "تريانغ" },
            { val: 4, label: "ثلاثيات" },
            { val: 5, label: "رباعيات" },
          ].map(({ val, label }) => (
            <label key={val} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedModes.includes(val)}
                onChange={() => toggleMode(val)}
                disabled={betMode}
              />
              {label}
            </label>
          ))}
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={betMode}
              onChange={handleBetToggle}
            />
            فوركست
          </label>
        </div>

        <div className="flex flex-row-reverse gap-2 items-center">
          <div className="flex flex-row-reverse gap-3 items-center">
            <p>الظريف</p>
            <select
              className="p-2 rounded text-right bg-white text-black"
              onChange={(e) => setSelectedClientId(parseInt(e.target.value))}
              value={selectedClientId ?? ""}
            >
              <option value="">اختر اسم الظريف</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-row-reverse gap-3 items-center">
            <p>المبلغ</p>
            <input
              type="number"
              value={ammount}
              onChange={(e) => setAmmount(e.target.value)}
              inputMode="decimal"
              className="p-2 rounded bg-white text-black"
            />
          </div>

          <button
            onClick={submitBet}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            إرسال الرهان
          </button>
        </div>
      </div>
    </div>
  );
}