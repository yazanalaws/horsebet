'use client'
import PlayView from "@/components/PlayView";
import React, { useEffect, useState } from "react";

export default function page() {
  const [matchId, setMatchId] = useState<number | null>(null);
  const [levelsCreated, setLevelsCreated] = useState(false);
  useEffect(() => {
    const getMatch = async () => {
      const res = await fetch("/api/match/current", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setMatchId(data.id);
      }
    };
    if (!matchId) {
      getMatch();
    }
  }, [matchId]);
  return (
    <div className="w-screen h-screen text-white">
      {matchId && <PlayView matchId={matchId} />}
    </div>
  );
}
