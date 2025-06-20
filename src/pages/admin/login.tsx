// pages/admin/login.tsx

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login failed: " + error.message);
    } else if (data?.user?.email === "dcmask@gmail.com") {
      navigate("/admin"); // go to admin dashboard
    } else {
      alert("Not an admin user");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-4 shadow border rounded">
      <h2 className="text-xl font-bold mb-4">Admin Login</h2>
      <input
        type="email"
        className="w-full mb-2 p-2 border rounded"
        placeholder="Admin Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="w-full mb-4 p-2 border rounded"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white py-2 px-4 rounded w-full"
      >
        Login
      </button>
    </div>
  );
}
