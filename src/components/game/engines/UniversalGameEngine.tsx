
import React, { useState, useEffect, useRef } from "react";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
  gameType: string;
  duration: number;
}

interface Props {
  gameType: string;
  duration: number;
  onNewResult: (result: GameRecord) => void;
}

const UniversalGameEngine: React.FC<Props> = ({ gameType, duration, onNewResult }) => {
  const [period, setPeriod] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(duration);
  const [result, setResult] = useState<GameRecord | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to generate the current period string based on duration and gameType
  const generatePeriod = (): string => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST
    
    const yyyy = istTime.getFullYear();
    const mm = String(istTime.getMonth() + 1).padStart(2, "0");
    const dd = String(istTime.getDate()).padStart(2, "0");

    // Calculate rounds since start of day in IST
    const startOfDay = new Date(istTime);
    startOfDay.setHours(0, 0, 0, 0);
    const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
    const durationInSeconds = duration;
    const roundNumber = Math.floor(secondsSinceStart / durationInSeconds) + 1;

    return `${yyyy}${mm}${dd}${String(roundNumber).padStart(3, "0")}`;
  };

  // Helper function to generate winning number and color
  const generateResult = (): GameRecord => {
    const winningNumber = Math.floor(Math.random() * 10); // 0-9

    // Color logic based on number
    let color = ["red"];
    if (winningNumber === 0) color = ["red", "violet"];
    else if (winningNumber === 5) color = ["green", "violet"];
    else if ([1, 3, 7, 9].includes(winningNumber)) color = ["green"];
    else if ([2, 4, 6, 8].includes(winningNumber)) color = ["red"];

    const newPeriod = generatePeriod();

    return {
      period: newPeriod,
      number: winningNumber,
      color,
      gameType,
      duration,
    };
  };

  // Countdown timer logic
  useEffect(() => {
    setPeriod(generatePeriod());
    setCountdown(duration);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      
      const startOfDay = new Date(istTime);
      startOfDay.setHours(0, 0, 0, 0);
      const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
      const secondsInCurrentRound = secondsSinceStart % duration;
      const remaining = duration - secondsInCurrentRound;
      
      const newPeriod = generatePeriod();
      setCountdown(remaining);
      setPeriod(newPeriod);

      // When countdown reaches 0, generate new result
      if (remaining === duration) {
        const newResult = generateResult();
        setResult(newResult);
        onNewResult(newResult);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameType, duration, onNewResult]);

  return null; // This is a logic-only component
};

export default UniversalGameEngine;
