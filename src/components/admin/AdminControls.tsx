import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminControls() {
  const [gameType, setGameType] = useState("Wingo1");
  const [period, setPeriod] = useState("");
  const [nextResult, setNextResult] = useState("");
  const [adminResults, setAdminResults] = useState([]);

  // Fetch existing admin result overrides
  const fetchAdminResults = async () => {
    const { data, error } = await supabase
      .from("admin_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Fetch error:", error.message);
    } else {
      setAdminResults(data);
    }
  };

  useEffect(() => {
    fetchAdminResults();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!period || !nextResult || !gameType) return alert("Please fill all fields.");

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
      fetchAdminResults();
    }
  };

  const deleteResult = async (id: string) => {
    const { error } = await supabase.from("admin_results").delete().eq("id", id);
    if (error) {
      alert("Delete failed");
    } else {
      alert("Deleted");
      fetchAdminResults();
    }
  };

  return (
    <div className="space-y-6">
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

      <div>
        <h2 className="text-lg font-semibold mb-4">🕒 Recent Admin Overrides</h2>
        <ul className="space-y-3">
          {adminResults.map((r: any) => (
            <li
              key={r.id}
              className="flex justify-between items-center bg-gray-100 p-3 rounded shadow-sm"
            >
              <div>
                <strong>{r.game_type}</strong> | Period: {r.period} →{" "}
                <span className="text-blue-700 font-bold">{r.next_result_number}</span>
              </div>
              <button
                onClick={() => deleteResult(r.id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
