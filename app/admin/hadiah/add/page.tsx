"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gift, ImagePlus, Save } from "lucide-react";
import AdminSidebar from "../../../../components/AdminSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY!;

export default function AddHadiahPage() {
  const router = useRouter();

  const [namaHadiah, setNamaHadiah] = useState("");
  const [poinDibutuhkan, setPoinDibutuhkan] = useState("");
  const [stok, setStok] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!namaHadiah.trim() || !poinDibutuhkan || !stok) {
      setError("Semua data wajib diisi.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Token tidak ditemukan. Silakan login kembali.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("namaHadiah", namaHadiah.trim());
      formData.append("poinDibutuhkan", poinDibutuhkan);
      formData.append("stok", stok);

      if (foto) {
        formData.append("foto", foto);
      }

      const response = await fetch(`${BASE_URL}/hadiah`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menambahkan data hadiah.");
      }

      setSuccess("Hadiah berhasil ditambahkan.");

      setTimeout(() => {
        router.push("/admin/hadiah");
        router.refresh();
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menambahkan hadiah.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminSidebar />

      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="mx-auto max-w-4xl px-5 py-8 lg:px-8">
          {/* HEADER */}
          <div className="mb-7 flex flex-col gap-4">
            <Link
              href="/admin/hadiah"
              className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-[#07966f]"
            >
              <ArrowLeft size={18} />
              Kembali
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                <Gift size={23} className="text-[#07966f]" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tambah Hadiah
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Tambahkan barang atau voucher hadiah baru.
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8"
          >
            {/* ERROR */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            )}

            <div className="space-y-5">
              {/* NAMA HADIAH */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Nama Hadiah
                </label>

                <input
                  type="text"
                  value={namaHadiah}
                  onChange={(e) => setNamaHadiah(e.target.value)}
                  placeholder="Contoh: Tissue 360 helai"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* POIN & STOK */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Poin yang Dibutuhkan
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={poinDibutuhkan}
                    onChange={(e) => setPoinDibutuhkan(e.target.value)}
                    placeholder="Contoh: 100"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Stok
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                    placeholder="Contoh: 50"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              {/* FOTO */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Foto Hadiah
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-10 transition hover:border-green-300 hover:bg-green-50">
                  <ImagePlus size={32} className="mb-3 text-[#07966f]" />

                  <span className="text-sm font-medium text-gray-700">
                    {foto ? foto.name : "Pilih foto hadiah"}
                  </span>

                  <span className="mt-1 text-xs text-gray-400">
                    JPG, JPEG, PNG
                  </span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFoto(file);
                    }}
                  />
                </label>

                {foto && (
                  <p className="mt-2 text-xs text-gray-500">
                    File dipilih: {foto.name}
                  </p>
                )}
              </div>
            </div>

            {/* BUTTON */}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/admin/hadiah"
                className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#07966f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#067f5e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />

                {loading ? "Menyimpan..." : "Simpan Hadiah"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
