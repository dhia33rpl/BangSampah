"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Recycle, ArrowLeft, Camera } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
    namaNasabah: "",
    alamat: "",
    telp: "",
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // CEK BASE URL
      if (!BASE_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_BASE_URL belum ditemukan. Cek file .env.local.",
        );
      }

      // CEK APP KEY
      if (!APP_KEY) {
        throw new Error(
          "NEXT_PUBLIC_APP_KEY belum ditemukan. Cek file .env.local.",
        );
      }

      console.log("BASE URL:", BASE_URL);
      console.log("APP KEY:", APP_KEY);

      // FORM DATA
      const data = new FormData();

      data.append("username", form.username);
      data.append("password", form.password);
      data.append("namaNasabah", form.namaNasabah);
      data.append("alamat", form.alamat);
      data.append("telp", form.telp);

      if (foto) {
        data.append("foto", foto);
      }

      // REQUEST REGISTER
      const response = await fetch(`${BASE_URL}/auth/nasabah/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
        },
        body: data,
      });

      const contentType = response.headers.get("content-type");

      let result;

      if (contentType?.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        throw new Error(
          text || `Request gagal dengan status ${response.status}`,
        );
      }

      console.log("REGISTER NASABAH:", result);

      if (!response.ok || !result.success) {
        throw new Error(result?.message || "Registrasi nasabah gagal.");
      }

      alert(result?.message || "Registrasi nasabah berhasil!");

      router.push("/login");
    } catch (err) {
      console.error("REGISTER NASABAH ERROR:", err);

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
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fb] px-5 py-10">
      <div className="w-full max-w-md">
        {/* KEMBALI */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#07966f]"
        >
          <ArrowLeft size={17} />
          Kembali
        </Link>

        {/* CARD */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* HEADER */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#07966f] text-white">
              <Recycle size={25} />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-[#172b4d]">
              Daftar Nasabah
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Daftarkan akunmu untuk mulai menggunakan Bank Sampah
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* USERNAME */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#304563]">
                Username
              </label>

              <input
                name="username"
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition focus:border-[#07966f]"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#304563]">
                Password
              </label>

              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition focus:border-[#07966f]"
              />
            </div>

            {/* NAMA */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#304563]">
                Nama Lengkap
              </label>

              <input
                name="namaNasabah"
                type="text"
                placeholder="Nama lengkap"
                value={form.namaNasabah}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition focus:border-[#07966f]"
              />
            </div>

            {/* ALAMAT */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#304563]">
                Alamat
              </label>

              <textarea
                name="alamat"
                placeholder="Alamat tempat tinggal"
                value={form.alamat}
                onChange={handleChange}
                required
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#07966f]"
              />
            </div>

            {/* TELEPON */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#304563]">
                Nomor Telepon
              </label>

              <input
                name="telp"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={form.telp}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition focus:border-[#07966f]"
              />
            </div>

            {/* FOTO */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#304563]">
                Foto Profil
              </label>

              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 transition hover:border-[#07966f] hover:bg-[#f7fffc]">
                <Camera size={28} className="text-[#07966f]" />

                <span className="mt-2 text-sm text-gray-500">
                  {foto ? foto.name : "Klik untuk pilih foto"}
                </span>

                <span className="mt-1 text-xs text-gray-400">JPG atau PNG</span>

                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    setFoto(e.target.files?.[0] || null);
                  }}
                />
              </label>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-[#07966f] text-sm font-semibold text-white transition hover:bg-[#078a68] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Mendaftarkan..." : "Daftar Nasabah"}
            </button>
          </form>

          {/* LOGIN */}
          <p className="mt-5 text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#07966f] hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
