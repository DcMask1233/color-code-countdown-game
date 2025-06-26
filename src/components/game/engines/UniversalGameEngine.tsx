import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  generatePeriod,
  GameType,
  GameMode,
  toIST,
} from "@/lib/periodUtils";

interface UniversalGameEngineProps {
  gameType: GameType;
  gameMode: GameMode;
}

export default function UniversalGameEngine({
  gameType,
  gameMode,
}: UniversalGameEngineProps) {
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [resultNumber, setResultNumber] = useState<number | null>(null);

  // 🔄 Set currentPeriod based on current IST time
  useEffect(() => {
    const nowIST = toIST(new Date());
    const period = generatePeriod(gameMode, nowIST);
    setCurrentPeriod(period);
  }, [gameMode]);

  // 📡 Subscribe to live result updates
  useEffect(() => {
    const channel = supabase
      .channel("game_results")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_results",
        },
        (payload) => {
          const match =
            payload.new.game_type === gameType &&
            payload.new.game_mode === gameMode &&
            payload.new.period === currentPeriod;

          if (match) {
            setResultNumber(payload.new.number);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameType, gameMode, currentPeriod]);

  // 🔁 Fallback fetch (in case real-time missed)
  useEffect(() => {
    const fetchResult = async () => {
      const { data } = await supabase
        .from("game_results")
        .select("number")
        .eq("game_type", gameType)
        .eq("game_mode", gameMode)
        .eq("period", currentPeriod)
        .single();

      setResultNumber(data?.number ?? null);
    };

    if (currentPeriod) fetchResult();
  }, [currentPeriod, gameType, gameMode]);

  return (
    <div className="p-4 border rounded shadow-md max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-3">
        {gameType} - {gameMode}
      </h2>

      <div className="mb-2">
        <p className="text-sm font-medium text-gray-600">Period</p>
        <p className="text-xl font-semibold text-gray-800">
          {currentPeriod || "Loading..."}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-600">Result</p>
        <p className="text-xl font-semibold text-gray-800">
          {resultNumber !== null ? resultNumber : "Waiting..."}
        </p>
      </div>
    </div>
  );
}
