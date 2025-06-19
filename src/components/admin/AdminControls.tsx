// components/admin/AdminControls.tsx

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import ResultOverridePanel from "./ResultOverridePanel";

export default function AdminControls() {
  const [gameType, setGameType] = useState("Wingo1");
  const [period, setPeriod] = useState("");
  const [nextResult, setNextResult] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!period || !nextResult || !gameType) {
      alert("Please fill all fields.");
      return;
    }

    const { error } = await supabase.from("admin_results").insert([
      {
        game_type: gameType,
        period: period,
        next_result_number: parseInt(nextResult),
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Result set successfully!");
      setPeriod("");
      setNextResult("");
    }
  };

  return (
    <div className="space-y-8">
      {/* Result override form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <input
          type="text"
          placeholder="Game Type (e.g., Wingo1)"
          value={gameType}
          onChange={(e) => setGameType(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Period Number"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Next Result Number (1-9)"
          value={nextResult}
          onChange={(e) => setNextResult(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
        >
          ✅ Set Result
        </button>
      </form>

      {/* Result list and delete actions */}
      <ResultOverridePanel />
    </div>
  );
}
