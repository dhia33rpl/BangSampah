"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Gift, ImagePlus, Save } from "lucide-react";
import Link from "next/link";
import AdminSidebar from "../../../../../components/AdminSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

interface Hadiah {
  id: string;
  namaHadiah: string;
  poinDibutuhkan: number;
  stok: number;
  foto?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Hadiah;
}

const getFotoUrl = (foto?: string) => {
  if (!foto) return "";

  const baseFotoUrl = BASE_URL.replace(/\/api\/v1\/?$/, "");
  return `${baseFotoUrl}${foto}`;
};

export default function EditHadiahPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [namaHadiah, setNamaHadiah] = useState("");
  const [poinDibutuhkan, setPoinDibutuhkan] = useState("");
  const [stok, setStok] = useState("");
  const [fotoLama, setFotoLama] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchDetailHadiah = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          return;
        }

        const response = await fetch(
          `${BASE_URL}/hadiah/${id}?_=${Date.now()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "x-app-key": APP_KEY,
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
            },
            cache: "no-store",
          },
        );

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil detail hadiah");
        }

        const hadiah = result.data;

        setNamaHadiah(hadiah.namaHadiah || "");
        setPoinDibutuhkan(String(hadiah.poinDibutuhkan ?? ""));
        setStok(String(hadiah.stok ?? ""));
        setFotoLama(hadiah.foto || "");

        if (hadiah.foto) {
          setPreview(getFotoUrl(hadiah.foto));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil data",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetailHadiah();
    }
  }, [id]);

  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFoto(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!namaHadiah.trim()) {
      setError("Nama hadiah wajib diisi.");
      return;
    }

    if (!poinDibutuhkan || Number(poinDibutuhkan) < 0) {
      setError("Poin yang dibutuhkan tidak valid.");
      return;
    }

    if (stok === "" || Number(stok) < 0) {
      setError("Stok tidak valid.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const formData = new FormData();

      formData.append("namaHadiah", namaHadiah.trim());
      formData.append("poinDibutuhkan", poinDibutuhkan);
      formData.append("stok", stok);

      if (foto) {
        formData.append("foto", foto);
      }

      const response = await fetch(`${BASE_URL}/hadiah/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memperbarui data hadiah");
      }

      setSuccess("Data hadiah berhasil diperbarui.");

      setTimeout(() => {
        router.push(`/admin/hadiah/${id}`);
        router.refresh();
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memperbarui hadiah",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminSidebar />

      {/* MAIN */}
      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="mx-auto max-w-4xl p-5 sm:p-7 lg:p-10">
          {/* HEADER */}
          <div className="mb-8">
            <Link
              href={`/admin/hadiah/${id}`}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#07966f]"
            >
              <ArrowLeft size={18} />
              Kembali ke Detail Hadiah
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <Gift size={24} className="text-[#07966f]" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Edit Hadiah
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Perbarui data hadiah yang tersedia untuk nasabah
                </p>
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
              <p className="text-sm text-gray-500">Memuat data hadiah...</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
            >
              {/* ERROR */}
              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
                {/* LEFT */}
                <div>
                  <h2 className="mb-5 text-lg font-semibold text-gray-800">
                    Informasi Hadiah
                  </h2>

                  {/* NAMA */}
                  <div className="mb-5">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Nama Hadiah
                    </label>

                    <input
                      type="text"
                      value={namaHadiah}
                      onChange={(e) => setNamaHadiah(e.target.value)}
                      placeholder="Contoh: Minyak Goreng 2 Liter"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-[#07966f]/10"
                    />
                  </div>

                  {/* POIN */}
                  <div className="mb-5">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Poin yang Dibutuhkan
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={poinDibutuhkan}
                      onChange={(e) => setPoinDibutuhkan(e.target.value)}
                      placeholder="Contoh: 120"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-[#07966f]/10"
                    />
                  </div>

                  {/* STOK */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Stok
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={stok}
                      onChange={(e) => setStok(e.target.value)}
                      placeholder="Contoh: 45"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-[#07966f]/10"
                    />
                  </div>
                </div>

                {/* RIGHT */}
                <div>
                  <h2 className="mb-5 text-lg font-semibold text-gray-800">
                    Foto Hadiah
                  </h2>

                  {/* PREVIEW */}
                  <div className="mb-4 flex h-64 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview hadiah"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Gift size={45} />

                        <p className="mt-2 text-sm">Belum ada foto</p>
                      </div>
                    )}
                  </div>

                  {/* INPUT FOTO */}
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-[#07966f] hover:bg-green-50">
                    <ImagePlus size={18} className="text-[#07966f]" />

                    {foto ? "Ganti Foto" : "Pilih Foto Baru"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="hidden"
                    />
                  </label>

                  <p className="mt-2 text-xs text-gray-400">
                    Kosongkan jika tidak ingin mengganti foto.
                  </p>

                  {fotoLama && !foto && (
                    <p className="mt-2 text-xs text-gray-400">
                      Foto saat ini akan tetap digunakan.
                    </p>
                  )}
                </div>
              </div>

              {/* BUTTON */}
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
                <Link
                  href={`/admin/hadiah/${id}`}
                  className="flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Batal
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#07966f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#067f5e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={18} />
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
