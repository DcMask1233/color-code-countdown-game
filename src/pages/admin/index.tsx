// pages/admin/index.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (data?.user) {
        if (data.user.email === "youradmin@email.com") {
          setUser(data.user);
        } else {
          router.push("/admin/login");
        }
      } else {
        router.push("/admin/login");
      }
    });
  }, []);

  if (!user) return <p className="text-center mt-10">Checking access...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      {/* Insert ResultOverridePanel and controls here */}
      <p>Welcome, {user.email}</p>
    </div>
  );
}
