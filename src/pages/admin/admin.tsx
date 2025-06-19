// pages/admin/admin.tsx

import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import AdminControls from "@/components/admin/AdminControls";

export default function AdminPage() {
  const router = useRouter();

  // Restrict access to a specific admin email
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data?.user?.email;
      if (!email || email !== "admin@example.com") {
        router.push("/");
      }
    });
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🎮 Admin Panel</h1>
      <AdminControls />
    </div>
  );
}
