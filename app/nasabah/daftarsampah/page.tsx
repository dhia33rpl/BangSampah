"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Recycle, Search, Tag, Coins, Scale } from "lucide-react";
import NasabahSidebar from "../../../components/NasabahSidebar";

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
  data: KategoriSampah[];
};

export default function KategoriNasabahPage() {
  const [kategori, setKategori] = useState<KategoriSampah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  /*
   * =====================================================
   * URL FOTO
   * =====================================================
   *
   * BASE_URL:
   * https://learn.smktelkom-mlg.sch.id/bank_sampah/api/v1
   *
   * Foto:
   * /uploads/xxxx.jpg
   *
   * Jadi /api/v1 harus dihilangkan untuk foto.
   */
  const getFotoUrl = (foto?: string) => {
    if (!foto) return "";

    const baseFotoUrl = BASE_URL.replace(/\/api\/v1\/?$/, "");

    return `${baseFotoUrl}${foto}`;
  };

  /*
   * =====================================================
   * GET KATEGORI SAMPAH
   *
   * GET /api/v1/kategori-sampah
   * =====================================================
   */
  const getKategori = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!BASE_URL) {
        throw new Error("API Base URL belum ditemukan.");
      }

      if (!APP_KEY) {
        throw new Error("App Key belum ditemukan.");
      }

      const url = `${BASE_URL}/kategori-sampah` + `?_=${Date.now()}`;

      console.log("GET KATEGORI SAMPAH:", url);

      const response = await fetch(url, {
        method: "GET",

        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          "Cache-Control": "no-cache",
        },

        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      console.log("RESPONSE KATEGORI SAMPAH:", result);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mengambil data kategori sampah.",
        );
      }

      setKategori(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Error get kategori sampah:", err);

      setKategori([]);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data kategori sampah.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getKategori();
  }, [getKategori]);

  /*
   * =====================================================
   * SEARCH
   * =====================================================
   */
  const filteredKategori = kategori.filter((item) => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return true;

    return (
      item.namaKategori.toLowerCase().includes(keyword) ||
      item.jenis.toLowerCase().includes(keyword)
    );
  });

  /*
   * =====================================================
   * FORMAT RUPIAH
   * =====================================================
   */
  const formatRupiah = (value: number) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  };

  /*
   * =====================================================
   * JENIS LABEL
   * =====================================================
   */
  const formatJenis = (jenis: string) => {
    if (!jenis) return "-";

    return jenis.charAt(0).toUpperCase() + jenis.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {/* =================================================
          SIDEBAR
      ================================================== */}
      <NasabahSidebar />

      {/* =================================================
          CONTENT
      ================================================== */}
      <main className="ml-[278px] min-h-screen w-[calc(100%-278px)]">
        <div className="w-full px-8 py-8 lg:px-10 xl:px-12">
          {/* =================================================
              HEADER
          ================================================== */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                <Recycle size={24} className="text-green-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-800">Harga Sampah</h1>
            </div>

            <p className="text-sm text-gray-500">
              Lihat daftar jenis sampah beserta harga dan poin yang berlaku.
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================== */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              SEARCH
          ================================================== */}
          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama kategori atau jenis sampah..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================== */}
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Loader2 size={22} className="animate-spin text-green-600" />
                Memuat kategori sampah...
              </div>
            </div>
          ) : filteredKategori.length === 0 ? (
            /* =================================================
                EMPTY
            ================================================== */
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <Recycle size={30} className="text-green-500" />
              </div>

              <h2 className="text-lg font-bold text-gray-800">
                Kategori tidak ditemukan
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Tidak ada kategori sampah yang sesuai dengan pencarian.
              </p>
            </div>
          ) : (
            /* =================================================
                LIST KATEGORI
            ================================================== */
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredKategori.map((item) => {
                const fotoUrl = getFotoUrl(item.foto);

                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* =================================================
                          FOTO
                      ================================================== */}
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt={item.namaKategori}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Recycle size={50} className="text-gray-300" />
                        </div>
                      )}

                      {/* JENIS */}
                      <div className="absolute left-4 top-4">
                        <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold capitalize text-green-700 shadow-sm">
                          {formatJenis(item.jenis)}
                        </span>
                      </div>
                    </div>

                    {/* =================================================
                          CONTENT
                      ================================================== */}
                    <div className="p-5">
                      {/* NAMA */}
                      <div className="mb-5">
                        <div className="mb-2 flex items-center gap-2">
                          <Tag size={17} className="text-green-600" />

                          <span className="text-xs font-medium text-gray-400">
                            Kategori Sampah
                          </span>
                        </div>

                        <h2 className="text-lg font-bold text-gray-800">
                          {item.namaKategori}
                        </h2>
                      </div>

                      {/* HARGA + POIN */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* HARGA */}
                        <div className="rounded-xl bg-green-50 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Scale size={16} className="text-green-600" />

                            <span className="text-xs font-medium text-gray-500">
                              Harga / Kg
                            </span>
                          </div>

                          <p className="text-base font-bold text-green-700">
                            {formatRupiah(item.hargaPerKg)}
                          </p>
                        </div>

                        {/* POIN */}
                        <div className="rounded-xl bg-yellow-50 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Coins size={16} className="text-yellow-600" />

                            <span className="text-xs font-medium text-gray-500">
                              Poin / Kg
                            </span>
                          </div>

                          <p className="text-base font-bold text-yellow-700">
                            {item.poinPerKg} poin
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
