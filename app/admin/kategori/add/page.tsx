"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Recycle,
  Save,
  Upload,
  Loader2,
  ImageIcon,
} from "lucide-react";
import AdminSidebar from "../../../../components/AdminSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

export default function AddKategoriPage() {
  const router = useRouter();

  const [namaKategori, setNamaKategori] = useState("");
  const [hargaPerKg, setHargaPerKg] = useState("");
  const [poinPerKg, setPoinPerKg] = useState("");
  const [jenis, setJenis] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFoto(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!namaKategori.trim()) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    if (!hargaPerKg) {
      setError("Harga per kg wajib diisi.");
      return;
    }

    if (!poinPerKg) {
      setError("Poin per kg wajib diisi.");
      return;
    }

    if (!jenis) {
      setError("Jenis sampah wajib dipilih.");
      return;
    }

    if (!foto) {
      setError("Foto kategori wajib dipilih.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const formData = new FormData();

      formData.append("namaKategori", namaKategori.trim());

      formData.append("hargaPerKg", hargaPerKg);

      formData.append("poinPerKg", poinPerKg);

      formData.append("jenis", jenis);

      formData.append("foto", foto);

      const response = await fetch(`${BASE_URL}/kategori-sampah`, {
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
        throw new Error(result.message || "Gagal menambahkan kategori sampah.");
      }

      router.push("/admin/kategori");
    } catch (err) {
      console.error("Error menambahkan kategori:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menambahkan kategori.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminSidebar />

      <main className="ml-[278px] min-h-screen w-[calc(100%-278px)]">
        <div className="w-full px-8 py-8 lg:px-10 xl:px-12">
          <button
            type="button"
            onClick={() => router.push("/admin/kategori")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-600"
          >
            <ArrowLeft size={18} />
            Kembali ke Kategori Sampah
          </button>

          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100">
              <Recycle size={28} className="text-green-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Tambah Kategori Sampah
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Tambahkan kategori sampah daur ulang baru
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6 w-full rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-7">
                <h2 className="text-lg font-bold text-gray-800">
                  Informasi Kategori
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Isi informasi kategori sampah di bawah ini.
                </p>
              </div>

              <div className="space-y-6">
                {/* NAMA KATEGORI */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nama Kategori
                  </label>

                  <input
                    type="text"
                    value={namaKategori}
                    onChange={(e) => setNamaKategori(e.target.value)}
                    placeholder="Contoh: Botol Kaca"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                {/* HARGA + POIN */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* HARGA */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Harga per Kg
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        Rp
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={hargaPerKg}
                        onChange={(e) => setHargaPerKg(e.target.value)}
                        placeholder="5000"
                        className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    </div>
                  </div>

                  {/* POIN */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Poin per Kg
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={poinPerKg}
                      onChange={(e) => setPoinPerKg(e.target.value)}
                      placeholder="10"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Jenis Sampah
                  </label>

                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  >
                    <option value="">Pilih jenis sampah</option>

                    <option value="kaca">Kaca</option>

                    <option value="plastik">Plastik</option>

                    <option value="logam">Logam</option>

                    <option value="kertas">Kertas</option>
                  </select>

                  <p className="mt-2 text-xs text-gray-400">
                    Pilihan jenis: Kaca, Plastik, Logam, dan Kertas.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 w-full rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-7">
                <h2 className="text-lg font-bold text-gray-800">
                  Foto Kategori
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Upload foto untuk kategori sampah.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* FOTO */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Foto
                  </label>

                  <label className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 text-center transition hover:border-green-400 hover:bg-green-50">
                    {foto ? (
                      <>
                        <ImageIcon size={42} className="mb-4 text-green-500" />

                        <p className="max-w-full truncate text-sm font-semibold text-gray-700">
                          {foto.name}
                        </p>

                        <p className="mt-1 text-xs text-green-600">
                          Foto berhasil dipilih
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload size={42} className="mb-4 text-green-500" />

                        <p className="text-sm font-semibold text-gray-700">
                          Pilih foto
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          JPG, JPEG, PNG
                        </p>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      className="hidden"
                      onChange={handleFotoChange}
                    />
                  </label>
                </div>

                {/* PREVIEW */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Preview
                  </label>

                  <div className="flex h-72 w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                    {foto ? (
                      <img
                        src={URL.createObjectURL(foto)}
                        alt="Preview foto kategori"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-300">
                        <ImageIcon size={42} />

                        <p className="mt-2 text-sm">Preview foto</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pb-10 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={() => router.push("/admin/kategori")}
                className="rounded-xl border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Simpan Kategori
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
