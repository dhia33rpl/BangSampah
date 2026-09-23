"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Recycle, ArrowLeft } from "lucide-react";

export default function RegisterAdminPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
    namaUnit: "",
    namaPengelola: "",
    telp: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    // Cek ENV
    if (!BASE_URL) {
      setError("API URL belum ditemukan.");
      return;
    }

    if (!APP_KEY) {
      setError("App Key belum ditemukan.");
      return;
    }

    // Cek form
    if (
      !form.username ||
      !form.password ||
      !form.namaUnit ||
      !form.namaPengelola ||
      !form.telp
    ) {
      setError("Semua data wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-key": APP_KEY,
        },
        body: JSON.stringify(form),
      });

      const text = await response.text();

      let result: any = {};

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          `Server mengembalikan response yang tidak valid (${response.status})`,
        );
      }

      if (!response.ok) {
        throw new Error(result.message || "Registrasi admin gagal.");
      }

      alert("Registrasi admin berhasil!");

      router.push("/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat registrasi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7faf7]">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
        <div className="w-full">
          {/* Back */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600"
          >
            <ArrowLeft size={18} />
            Kembali
          </Link>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
              <Recycle size={30} className="text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800">Register Admin</h1>

            <p className="mt-2 text-sm text-gray-500">
              Daftarkan unit Bank Sampah kamu
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
          >
            {/* Username */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Username
              </label>

              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Masukkan username"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Nama Unit */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Nama Unit Bank Sampah
              </label>

              <input
                type="text"
                name="namaUnit"
                value={form.namaUnit}
                onChange={handleChange}
                placeholder="Contoh: Bank Sampah Asri"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Nama Pengelola */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Nama Pengelola
              </label>

              <input
                type="text"
                name="namaPengelola"
                value={form.namaPengelola}
                onChange={handleChange}
                placeholder="Masukkan nama pengelola"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Telepon */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Nomor Telepon
              </label>

              <input
                type="tel"
                name="telp"
                value={form.telp}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-600 py-3.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Mendaftarkan..." : "Daftar Admin"}
            </button>
          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-green-600 hover:text-green-700"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
