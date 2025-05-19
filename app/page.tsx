'use client'
import LevelsCreator from "@/components/levelsCreator";
import NewMatch from "@/components/NewMatch";
import PlayView from "@/components/PlayView";
import { useState } from "react";

export default function Home() {
  const [matchId, setMatchId] = useState<number | null>(null);
  const [levelsCreated , setLevelsCreated] = useState(false)
  return (
    <div className="w-screen h-screen text-white">
      {!levelsCreated && !matchId && <NewMatch setMatchId={setMatchId} />}
      {!levelsCreated && matchId &&
         <LevelsCreator setLevelsCreated={setLevelsCreated}  matchId={matchId}/>
      }
      {levelsCreated && matchId &&
        <PlayView matchId={matchId} />
      }
    </div>
  );
}
