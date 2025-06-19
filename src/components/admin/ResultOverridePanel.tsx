import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AdminResult {
  id: string;
  game_type: string;
  period: string;
  next_result_number: number;
  created_at: string;
}

export default function ResultOverridePanel() {
  const [adminResults, setAdminResults] = useState<AdminResult[]>([]);

  const fetchAdminResults = async () => {
    const { data, error } = await supabase
      .from("admin_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Failed to fetch overrides:", error.message);
    } else {
      setAdminResults(data || []);
    }
  };

  const deleteResult = async (id: string) => {
    const { error } = await supabase.from("admin_results").delete().eq("id", id);
    if (error) {
      alert("Failed to delete result");
    } else {
      alert("Override deleted");
      fetchAdminResults();
    }
  };

  useEffect(() => {
    fetchAdminResults();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">🕒 Recent Admin Overrides</h2>
      <ul className="space-y-3">
        {adminResults.length === 0 ? (
          <li className="text-gray-500">No overrides found.</li>
        ) : (
          adminResults.map((r) => (
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
          ))
        )}
      </ul>
    </div>
  );
}
