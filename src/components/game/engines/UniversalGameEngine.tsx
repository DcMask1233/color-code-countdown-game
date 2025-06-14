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
    // Example: "20250614-3min-001"
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    // Calculate which round in the day for this duration
    const secondsInDay = 24 * 60 * 60;
    const durationInSeconds = duration * 60;
    const secondsSinceMidnight =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const roundNumber = Math.floor(secondsSinceMidnight / durationInSeconds) + 1;
    const roundNumberStr = String(roundNumber).padStart(3, "0");

    return `${yyyy}${mm}${dd}-${gameType}-${roundNumberStr}`;
  };

  // Helper function to generate winning number and color
  const generateResult = (): GameRecord => {
    const winningNumber = Math.floor(Math.random() * 10); // 0-9

    // Example color logic (can be customized)
    let color = ["red"];
    if (winningNumber % 2 === 0) color = ["green"];
    else if (winningNumber === 5) color = ["yellow"];

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
    setCountdown(duration * 60);

    if (intervalRef.current) clearInterval(intervalRef.current);

    inter
