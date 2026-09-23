"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Recycle,
  Save,
  Upload,
  Loader2,
  ImageIcon,
} from "lucide-react";
import AdminSidebar from "../../../../../components/AdminSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

type KategoriSampah = {
  id: string;
  appMakerId: string;
  namaKategori: string;
  hargaPerKg: number;
  poinPerKg: number;
  jenis: string;
  foto?: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: KategoriSampah;
};

export default function EditKategoriPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [namaKategori, setNamaKategori] = useState("");
  const [hargaPerKg, setHargaPerKg] = useState("");
  const [poinPerKg, setPoinPerKg] = useState("");
  const [jenis, setJenis] = useState("");

  const [fotoLama, setFotoLama] = useState("");
  const [fotoBaru, setFotoBaru] = useState<File | null>(null);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // URL FOTO
  // ==========================================
  const getFotoUrl = (foto?: string) => {
    if (!foto) return "";

    if (foto.startsWith("http://") || foto.startsWith("https://")) {
      return foto;
    }

    const baseWithoutApi = BASE_URL.replace(/\/api\/v1\/?$/, "");

    if (foto.startsWith("/")) {
      return `${baseWithoutApi}${foto}`;
    }

    return `${baseWithoutApi}/${foto}`;
  };

  // ==========================================
  // GET DETAIL KATEGORI
  // ==========================================
  useEffect(() => {
    if (!id) return;

    const fetchKategori = async () => {
      try {
        setLoadingData(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          return;
        }

        if (!BASE_URL) {
          setError("NEXT_PUBLIC_API_BASE_URL belum ditemukan.");
          return;
        }

        if (!APP_KEY) {
          setError("NEXT_PUBLIC_APP_KEY belum ditemukan.");
          return;
        }

        const response = await fetch(
          `${BASE_URL}/kategori-sampah/${id}?_=${Date.now()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "x-app-key": APP_KEY,
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
            cache: "no-store",
          },
        );

        const result: ApiResponse = await response.json();

        console.log("GET DETAIL KATEGORI:", result);

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal mengambil data kategori sampah.",
          );
        }

        const data = result.data;

        setNamaKategori(data.namaKategori || "");

        setHargaPerKg(
          data.hargaPerKg !== undefined && data.hargaPerKg !== null
            ? String(data.hargaPerKg)
            : "",
        );

        setPoinPerKg(
          data.poinPerKg !== undefined && data.poinPerKg !== null
            ? String(data.poinPerKg)
            : "",
        );

        setJenis(data.jenis ? data.jenis.toLowerCase().trim() : "");

        setFotoLama(data.foto || "");
      } catch (err) {
        console.error("Error mengambil data kategori:", err);

        setError(
          err instanceof Error ? err.message : "Gagal mengambil data kategori.",
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchKategori();
  }, [id]);

  // ==========================================
  // PILIH FOTO BARU
  // ==========================================
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFotoBaru(file);
  };

  // ==========================================
  // SUBMIT EDIT
  // ==========================================
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

    if (Number(hargaPerKg) < 0) {
      setError("Harga per kg tidak boleh kurang dari 0.");
      return;
    }

    if (!poinPerKg) {
      setError("Poin per kg wajib diisi.");
      return;
    }

    if (Number(poinPerKg) < 0) {
      setError("Poin per kg tidak boleh kurang dari 0.");
      return;
    }

    if (!jenis) {
      setError("Jenis sampah wajib dipilih.");
      return;
    }

    try {
      setLoadingSubmit(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      if (!BASE_URL) {
        setError("NEXT_PUBLIC_API_BASE_URL belum ditemukan.");
        return;
      }

      if (!APP_KEY) {
        setError("NEXT_PUBLIC_APP_KEY belum ditemukan.");
        return;
      }

      const formData = new FormData();

      formData.append("namaKategori", namaKategori.trim());

      formData.append("hargaPerKg", hargaPerKg);

      formData.append("poinPerKg", poinPerKg);

      formData.append("jenis", jenis);

      // Foto hanya dikirim jika memilih foto baru
      if (fotoBaru) {
        formData.append("foto", fotoBaru);
      }

      const response = await fetch(`${BASE_URL}/kategori-sampah/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      console.log("UPDATE KATEGORI:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memperbarui kategori sampah.");
      }

      router.push(`/admin/kategori/${id}`);
      router.refresh();
    } catch (err) {
      console.error("Error memperbarui kategori:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memperbarui kategori.",
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <AdminSidebar />

        <main className="ml-0 flex min-h-screen w-full items-center justify-center pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 size={24} className="animate-spin text-green-600" />

            <span>Memuat data kategori...</span>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // CONTENT
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminSidebar />

      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="w-full px-5 py-8 sm:px-7 lg:px-10 xl:px-12">
          {/* ==================================
              BACK BUTTON
          =================================== */}
          <button
            type="button"
            onClick={() => router.push(`/admin/kategori/${id}`)}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-600"
          >
            <ArrowLeft size={18} />
            Kembali ke Detail Kategori
          </button>

          {/* ==================================
              HEADER
          =================================== */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100">
              <Recycle size={28} className="text-green-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                Edit Kategori Sampah
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Ubah informasi kategori sampah
              </p>
            </div>
          </div>

          {/* ==================================
              ERROR
          =================================== */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ==================================
                INFORMASI KATEGORI
            =================================== */}
            <div className="mb-6 w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
              <div className="mb-7">
                <h2 className="text-lg font-bold text-gray-800">
                  Informasi Kategori
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Perbarui data kategori sampah di bawah ini.
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

                {/* HARGA DAN POIN */}
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

                {/* JENIS */}
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

                    <option value="plastik">Plastik</option>

                    <option value="kertas">Kertas</option>

                    <option value="logam">Logam</option>

                    <option value="kaca">Kaca</option>
                  </select>

                  <p className="mt-2 text-xs text-gray-400">
                    Pilihan jenis: Plastik, Kertas, Logam, dan Kaca.
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================
                FOTO KATEGORI
            =================================== */}
            <div className="mb-6 w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
              <div className="mb-7">
                <h2 className="text-lg font-bold text-gray-800">
                  Foto Kategori
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Lihat foto saat ini atau pilih foto baru.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* FOTO LAMA */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Foto Saat Ini
                  </label>

                  <div className="flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 sm:h-72">
                    {fotoLama ? (
                      <img
                        src={getFotoUrl(fotoLama)}
                        alt="Foto kategori"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-300">
                        <ImageIcon size={42} />

                        <p className="mt-2 text-sm">Belum ada foto</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* FOTO BARU */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Ganti Foto
                  </label>

                  <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 text-center transition hover:border-green-400 hover:bg-green-50 sm:h-72">
                    {fotoBaru ? (
                      <>
                        <ImageIcon size={40} className="mb-4 text-green-500" />

                        <p className="max-w-full truncate text-sm font-semibold text-gray-700">
                          {fotoBaru.name}
                        </p>

                        <p className="mt-1 text-xs text-green-600">
                          Foto baru dipilih
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload size={40} className="mb-4 text-green-500" />

                        <p className="text-sm font-semibold text-gray-700">
                          Pilih foto baru
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

                  {!fotoBaru && (
                    <p className="mt-2 text-xs text-gray-400">
                      Kosongkan jika tidak ingin mengganti foto.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ==================================
                BUTTON
            =================================== */}
            <div className="flex flex-col-reverse gap-3 pb-10 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={loadingSubmit}
                onClick={() => router.push(`/admin/kategori/${id}`)}
                className="rounded-xl border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loadingSubmit}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingSubmit ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Simpan Perubahan
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
