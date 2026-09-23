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
      // =========================
      // 1. LOGIN
      // =========================
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-app-key": APP_KEY,
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const loginResult = await loginResponse.json();

      console.log("LOGIN RESPONSE:", loginResult);

      if (!loginResponse.ok || !loginResult.success) {
        throw new Error(loginResult.message || "Login gagal");
      }

      // =========================
      // 2. AMBIL TOKEN
      // =========================
      const token =
        loginResult.token ||
        loginResult.accessToken ||
        loginResult.data?.token ||
        loginResult.data?.accessToken;

      if (!token) {
        console.error("Response login tidak memiliki token:", loginResult);

        throw new Error("Token login tidak ditemukan dari response server.");
      }

      // =========================
      // 3. SIMPAN TOKEN
      // =========================
      localStorage.setItem("token", token);

      // Hapus role lama supaya tidak memakai
      // role dari login sebelumnya.
      localStorage.removeItem("role");

      // =========================
      // 4. CEK PROFILE USER
      // GET /auth/me
      // =========================
      const profileResponse = await fetch(
        `${BASE_URL}/auth/me?_=${Date.now()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "x-app-key": APP_KEY,
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );

      const profileResult = await profileResponse.json();

      console.log("AUTH ME RESPONSE:", profileResult);

      if (!profileResponse.ok || !profileResult.success) {
        localStorage.removeItem("token");

        throw new Error(
          profileResult.message || "Gagal mengambil data profil user.",
        );
      }

      // =========================
      // 5. AMBIL ROLE DARI /auth/me
      // =========================
      const role = profileResult.data?.role || profileResult.role;

      if (!role) {
        localStorage.removeItem("token");

        throw new Error("Role user tidak ditemukan.");
      }

      // Simpan role yang benar dari backend
      localStorage.setItem("role", role.toUpperCase());

      // =========================
      // 6. REDIRECT SESUAI ROLE
      // =========================
      if (role.toUpperCase() === "ADMIN") {
        router.replace("/admin/dashboard");
        return;
      }

      if (role.toUpperCase() === "NASABAH") {
        router.replace("/nasabah/dashboard");
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("role");

      throw new Error(`Role "${role}" tidak dikenali.`);
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat login.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fb] px-5">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7">
        {/* JUDUL */}
        <div className="mb-7 text-center">
          <div className="mb-3 text-4xl">♻️</div>

          <h1 className="text-2xl font-bold text-[#172b4d]">Bank Sampah</h1>

          <p className="mt-1 text-sm text-gray-500">Bersih Mandiri</p>
        </div>

        <h2 className="text-xl font-bold text-[#172b4d]">Selamat Datang</h2>

        <p className="mb-6 mt-1 text-sm text-gray-500">
          Silakan masuk ke akun kamu.
        </p>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* USERNAME */}
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
              className="mt-2 h-11 w-full rounded-lg border border-gray-300 px-4 text-gray-700 outline-none focus:border-[#07966f]"
            />
          </div>

          {/* PASSWORD */}
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
              className="mt-2 h-11 w-full rounded-lg border border-gray-300 px-4 text-gray-700 outline-none focus:border-[#07966f]"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-[#07966f] font-semibold text-white hover:bg-[#078a68] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* DAFTAR */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-[#07966f]">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </main>
  );
}
