// pages/admin/admin.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import AdminControls from "@/components/admin/AdminControls";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user || data.user.email !== ADMIN_EMAIL) {
        navigate("/");
      } else {
        setLoading(false);
      }
    }
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        navigate("/");
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, [navigate]);

  if (loading) return <div>Loading Admin Panel...</div>;

  return <AdminControls />;
}
