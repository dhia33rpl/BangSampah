"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  User,
  Lock,
  MapPin,
  Phone,
  Camera,
  X,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY;

export default function AddCustomerPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [namaNasabah, setNamaNasabah] = useState("");
  const [alamat, setAlamat] = useState("");
  const [telp, setTelp] = useState("");

  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // PILIH FOTO
  // =========================
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Cek format
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setError("Foto harus berformat JPG atau PNG.");
      return;
    }

    // Maksimal 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }

    setError("");
    setFoto(file);

    // Preview
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  // =========================
  // HAPUS FOTO
  // =========================
  const handleRemoveFoto = () => {
    setFoto(null);
    setPreview("");
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    // Validasi
    if (!username || !password || !namaNasabah || !alamat || !telp) {
      setError("Semua field wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // FormData karena ada upload foto
      const formData = new FormData();

      formData.append("username", username);
      formData.append("password", password);
      formData.append("namaNasabah", namaNasabah);
      formData.append("alamat", alamat);
      formData.append("telp", telp);

      // Foto dikirim dengan nama field "foto"
      if (foto) {
        formData.append("foto", foto);
      }

      const response = await fetch(`${BASE_URL}/admin/nasabah`, {
        method: "POST",
        headers: {
          "x-app-key": APP_KEY || "",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      console.log("Response:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menambahkan nasabah");
      }

      alert("Data nasabah berhasil ditambahkan!");

      router.push("/admin/listNasabah");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menambahkan nasabah",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        {/* BACK */}
        <button
          type="button"
          onClick={() => router.push("/admin/listNasabah")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-600"
        >
          <ArrowLeft size={18} />
          Kembali ke Daftar Nasabah
        </button>

        {/* HEADER */}
        <div className="mb-7">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
            <UserPlus size={24} className="text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800">Add Customer</h1>

          <p className="mt-1 text-sm text-gray-400">
            Tambahkan data nasabah baru ke Bank Sampah
          </p>
        </div>

        {/* FORM */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ERROR */}
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* =========================
                USERNAME
            ========================= */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: nafi"
                  required
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            {/* =========================
                PASSWORD
            ========================= */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            {/* =========================
                NAMA NASABAH
            ========================= */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nama Nasabah <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={namaNasabah}
                  onChange={(e) => setNamaNasabah(e.target.value)}
                  placeholder="Contoh: Nafi"
                  required
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            {/* =========================
                ALAMAT
            ========================= */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Alamat <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-4 top-4 text-gray-400"
                />

                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Contoh: Jl. Kenanga No.5"
                  rows={4}
                  required
                  className="w-full resize-none rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            {/* =========================
                TELEPON
            ========================= */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="tel"
                  value={telp}
                  onChange={(e) => setTelp(e.target.value)}
                  placeholder="Contoh: 081987654321"
                  required
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            {/* =========================
                FOTO
            ========================= */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Foto Nasabah
              </label>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* PREVIEW */}
                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                  {preview ? (
                    <>
                      <img
                        src={preview}
                        alt="Preview foto"
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={handleRemoveFoto}
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                      >
                        <X size={15} />
                      </button>
                    </>
                  ) : (
                    <Camera size={28} className="text-gray-300" />
                  )}
                </div>

                {/* FILE INPUT */}
                <div>
                  <label
                    htmlFor="foto"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    <Camera size={17} />
                    Pilih Foto
                  </label>

                  <input
                    id="foto"
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={handleFotoChange}
                    className="hidden"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Upload file foto profil (JPG/PNG)
                  </p>

                  {foto && (
                    <p className="mt-1 text-xs font-medium text-green-600">
                      {foto.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* =========================
                BUTTON
            ========================= */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/admin/listNasabah")}
                disabled={loading}
                className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Menambahkan...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Add Customer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
