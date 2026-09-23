"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Plus,
  Recycle,
  Trash2,
  Scale,
} from "lucide-react";
import NasabahSidebar from "../../../../components/NasabahSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

type KategoriSampah = {
  id: string;
  namaKategori: string;
  hargaPerKg: number;
  poinPerKg: number;
  jenis: string;
  foto?: string;
};

type ItemSetoran = {
  kategoriSampahId: string;
  beratKg: string;
};

const jenisYangDiizinkan = ["kaca", "plastik", "kertas", "logam"];

export default function AddSetoranPage() {
  const router = useRouter();

  const [tanggal, setTanggal] = useState("");
  const [catatan, setCatatan] = useState("");

  const [kategori, setKategori] = useState<KategoriSampah[]>([]);

  const [items, setItems] = useState<ItemSetoran[]>([
    {
      kategoriSampahId: "",
      beratKg: "",
    },
  ]);

  const [loadingKategori, setLoadingKategori] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // GET KATEGORI SAMPAH
  // =========================
  const fetchKategori = async () => {
    try {
      setLoadingKategori(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      if (!BASE_URL) {
        throw new Error("API Base URL belum ditemukan.");
      }

      if (!APP_KEY) {
        throw new Error("App Key belum ditemukan.");
      }

      const response = await fetch(
        `${BASE_URL}/kategori-sampah?_=${Date.now()}`,
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

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil kategori sampah");
      }

      // Hanya tampilkan jenis:
      // kaca, plastik, kertas, logam
      const kategoriFiltered = (result.data || []).filter(
        (item: KategoriSampah) =>
          jenisYangDiizinkan.includes(item.jenis?.toLowerCase()),
      );

      setKategori(kategoriFiltered);
    } catch (err) {
      console.error("Error get kategori:", err);

      setError(
        err instanceof Error ? err.message : "Gagal mengambil kategori sampah",
      );
    } finally {
      setLoadingKategori(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  // =========================
  // TAMBAH ITEM
  // =========================
  const handleAddItem = () => {
    setItems((dataLama) => [
      ...dataLama,
      {
        kategoriSampahId: "",
        beratKg: "",
      },
    ]);
  };

  // =========================
  // HAPUS ITEM
  // =========================
  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      return;
    }

    setItems((dataLama) => dataLama.filter((_, i) => i !== index));
  };

  // =========================
  // UBAH ITEM
  // =========================
  const handleItemChange = (
    index: number,
    field: keyof ItemSetoran,
    value: string,
  ) => {
    setItems((dataLama) =>
      dataLama.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      if (!BASE_URL) {
        throw new Error("API Base URL belum ditemukan.");
      }

      if (!APP_KEY) {
        throw new Error("App Key belum ditemukan.");
      }

      // =========================
      // VALIDASI TANGGAL
      // =========================
      if (!tanggal) {
        alert("Tanggal setoran wajib diisi.");
        return;
      }

      // =========================
      // VALIDASI CATATAN
      // =========================
      if (!catatan.trim()) {
        alert("Catatan wajib diisi.");
        return;
      }

      // =========================
      // VALIDASI KATEGORI
      // =========================
      const adaKategoriKosong = items.some((item) => !item.kategoriSampahId);

      if (adaKategoriKosong) {
        alert("Silakan pilih kategori sampah.");
        return;
      }

      // =========================
      // VALIDASI BERAT
      // =========================
      const adaBeratKosong = items.some(
        (item) => !item.beratKg || Number(item.beratKg) <= 0,
      );

      if (adaBeratKosong) {
        alert("Berat sampah harus lebih dari 0 kg.");
        return;
      }

      // =========================
      // CEGAH KATEGORI DUPLIKAT
      // =========================
      const kategoriIds = items.map((item) => item.kategoriSampahId);

      const adaDuplikat = new Set(kategoriIds).size !== kategoriIds.length;

      if (adaDuplikat) {
        alert(
          "Kategori sampah yang sama tidak boleh dipilih lebih dari satu kali.",
        );
        return;
      }

      // =========================
      // BODY SESUAI SWAGGER
      // =========================
      const body = {
        tanggal: new Date(`${tanggal}T10:00:00`).toISOString(),

        catatan: catatan.trim(),

        items: items.map((item) => ({
          // Yang dikirim adalah ID kategori,
          // bukan nama/jenis kategori
          kategoriSampahId: item.kategoriSampahId,

          beratKg: Number(item.beratKg),
        })),
      };

      console.log("BODY ADD SETORAN:", body);

      // =========================
      // POST PENGAJUAN SETORAN
      // =========================
      const response = await fetch(`${BASE_URL}/setor-sampah/pengajuan`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      console.log("RESPONSE ADD SETORAN:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengajukan setoran sampah");
      }

      // =========================
      // BERHASIL
      // =========================
      alert(result.message || "Pengajuan setoran berhasil dibuat.");

      // Redirect ke halaman histori setoran NASABAH
      router.push("/nasabah/setoran");
    } catch (err) {
      console.error("Error add setoran:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengajukan setoran",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // LABEL JENIS
  // =========================
  const getJenisLabel = (jenis: string) => {
    if (!jenis) return "";

    return jenis.charAt(0).toUpperCase() + jenis.slice(1);
  };

  return (
    <>
      <NasabahSidebar />

      <main className="ml-[278px] min-h-screen w-[calc(100%-278px)] bg-[#f7faf7]">
        <div className="w-full px-8 py-8 lg:px-10 xl:px-12">
          {/* =========================
              HEADER
          ========================= */}
          <div className="mb-7 flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Ajukan Setoran Sampah
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Isi data sampah yang ingin kamu setorkan.
              </p>
            </div>
          </div>

          {/* =========================
              ERROR
          ========================= */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* =========================
                DATA SETORAN
            ========================= */}
            <div className="mb-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-green-50 p-2.5">
                    <Recycle size={20} className="text-green-600" />
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-800">Data Setoran</h2>

                    <p className="text-xs text-gray-400">
                      Tentukan tanggal dan catatan setoran.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
                {/* TANGGAL */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Tanggal Setoran
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="date"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                </div>

                {/* CATATAN */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Catatan
                  </label>

                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={1}
                    placeholder="Contoh: Mohon dijemput di depan rumah"
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>
            </div>

            {/* =========================
                ITEM SAMPAH
            ========================= */}
            <div className="mb-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-green-50 p-2.5">
                    <Scale size={20} className="text-green-600" />
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-800">Jenis Sampah</h2>

                    <p className="text-xs text-gray-400">
                      Pilih jenis dan masukkan estimasi berat.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={loadingKategori || items.length >= kategori.length}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={17} />
                  Tambah
                </button>
              </div>

              <div className="space-y-4 px-6 py-6">
                {loadingKategori ? (
                  <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Memuat kategori sampah...
                  </div>
                ) : kategori.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 px-5 py-8 text-center text-sm text-gray-400">
                    Belum ada kategori sampah yang tersedia.
                  </div>
                ) : (
                  items.map((item, index) => {
                    // ID kategori yang sudah
                    // dipilih item lain
                    const selectedIds = items
                      .filter((_, i) => i !== index)
                      .map((other) => other.kategoriSampahId);

                    return (
                      <div
                        key={index}
                        className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                      >
                        {/* HEADER ITEM */}
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-700">
                            Sampah {index + 1}
                          </p>

                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {/* KATEGORI */}
                          <div>
                            <label className="mb-2 block text-xs font-semibold text-gray-500">
                              Jenis Sampah
                            </label>

                            <select
                              value={item.kategoriSampahId}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "kategoriSampahId",
                                  e.target.value,
                                )
                              }
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                            >
                              <option value="">Pilih jenis sampah</option>

                              {kategori.map((kategoriItem) => (
                                <option
                                  key={kategoriItem.id}
                                  value={kategoriItem.id}
                                  disabled={selectedIds.includes(
                                    kategoriItem.id,
                                  )}
                                >
                                  {getJenisLabel(kategoriItem.jenis)}
                                </option>
                              ))}
                            </select>

                            {/* INFO KATEGORI */}
                            {item.kategoriSampahId && (
                              <div className="mt-2">
                                {(() => {
                                  const selected = kategori.find(
                                    (k) => k.id === item.kategoriSampahId,
                                  );

                                  if (!selected) {
                                    return null;
                                  }

                                  return (
                                    <p className="text-xs text-gray-400">
                                      {selected.namaKategori} •{" "}
                                      {selected.poinPerKg} poin/kg
                                    </p>
                                  );
                                })()}
                              </div>
                            )}
                          </div>

                          {/* BERAT */}
                          <div>
                            <label className="mb-2 block text-xs font-semibold text-gray-500">
                              Estimasi Berat (Kg)
                            </label>

                            <div className="relative">
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={item.beratKg}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "beratKg",
                                    e.target.value,
                                  )
                                }
                                placeholder="Contoh: 2.5"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                              />

                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                                kg
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* =========================
                BUTTON
            ========================= */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/nasabah/setoran")}
                disabled={submitting}
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={submitting || loadingKategori}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Mengajukan...
                  </>
                ) : (
                  <>
                    <Recycle size={18} />
                    Ajukan Setoran
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
