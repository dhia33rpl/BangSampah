"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY!;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-key": APP_KEY,
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Login gagal");
      }

      const token =
        result.token || result.data?.token || result.data?.accessToken;

      const role = result.role || result.data?.role;

      if (!token || !role) {
        throw new Error("Data login tidak lengkap");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role.toLowerCase() === "nasabah") {
        router.push("/nasabah/dashboard");
      } else if (role.toLowerCase() === "admin") {
        router.push("/admin/dashboard");
      } else {
        throw new Error("Role tidak dikenali");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-5">
      <div className="w-full max-w-md bg-white p-7 rounded-2xl border border-gray-200">
        {/* JUDUL */}
        <div className="text-center mb-7">
          <div className="text-4xl mb-3">♻️</div>

          <h1 className="text-2xl font-bold text-[#172b4d]">Bank Sampah</h1>

          <p className="text-sm text-gray-500 mt-1">Bersih Mandiri</p>
        </div>

        <h2 className="text-xl font-bold text-[#172b4d]">Selamat Datang</h2>

        <p className="text-sm text-gray-500 mt-1 mb-6">
          Silakan masuk ke akun kamu.
        </p>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm mb-4">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#304563]">
              Username
            </label>

            <input
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full mt-2 h-11 px-4 rounded-lg border text-gray-700 border-gray-300 outline-none focus:border-[#07966f]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#304563]">
              Password
            </label>

            <input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-2 h-11 px-4 rounded-lg border text-gray-700 border-gray-300 outline-none focus:border-[#07966f]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-[#07966f] text-white font-semibold hover:bg-[#078a68] disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* DAFTAR */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="text-[#07966f] font-semibold">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </main>
  );
}
