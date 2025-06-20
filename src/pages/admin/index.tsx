// pages/admin/index.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (data?.user) {
        if (data.user.email === "dcmask21@gmail.com") {
          setUser(data.user);
        } else {
          navigate("/admin/login");
        }
      } else {
        navigate("/admin/login");
      }
    });
  }, [navigate]);

  if (!user) return <p className="text-center mt-10">Checking access...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      {/* Insert ResultOverridePanel and controls here */}
      <p>Welcome, {user.email}</p>
    </div>
  );
}
