"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gift, Plus, Search, Eye } from "lucide-react";
import AdminSidebar from "../../../components/AdminSidebar";

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
  data: Hadiah[];
}

const getFotoUrl = (foto?: string) => {
  if (!foto) return "";

  const baseFotoUrl = BASE_URL.replace(/\/api\/v1\/?$/, "");
  return `${baseFotoUrl}${foto}`;
};

export default function AdminHadiahPage() {
  const [data, setData] = useState<Hadiah[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHadiah = async () => {
    try {
      setLoading(true);
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

      const response = await fetch(`${BASE_URL}/hadiah?_=${Date.now()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      console.log("GET HADIAH:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data hadiah.");
      }

      setData(result.data || []);
    } catch (err) {
      console.error("GET HADIAH ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHadiah();
  }, []);

  const filteredData = data.filter((item) =>
    item.namaHadiah.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminSidebar />

      {/* MAIN */}
      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="p-5 sm:p-7 lg:p-10">
          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Gift size={24} className="text-[#07966f]" />

                <h1 className="text-2xl font-bold text-[#172b4d]">
                  Katalog Hadiah
                </h1>
              </div>

              <p className="text-sm text-[#718198]">
                Kelola daftar hadiah yang tersedia untuk nasabah
              </p>
            </div>

            {/* BUTTON TAMBAH HADIAH */}
            <Link
              href="/admin/hadiah/add"
              className="flex w-fit items-center gap-2 rounded-xl bg-[#07966f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#067f5e]"
            >
              <Plus size={18} />
              Tambah Hadiah
            </Link>
          </div>

          {/* SEARCH */}
          <div className="mb-7">
            <div className="relative max-w-md">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama hadiah..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-[#07966f]/10"
              />
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#e3e8ef] bg-white">
              <p className="text-sm text-[#718198]">Memuat data hadiah...</p>
            </div>
          ) : filteredData.length === 0 ? (
            /* EMPTY */
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#e3e8ef] bg-white px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9fbf4]">
                <Gift size={30} className="text-[#07966f]" />
              </div>

              <h2 className="text-lg font-semibold text-[#172b4d]">
                {search ? "Hadiah tidak ditemukan" : "Belum ada hadiah"}
              </h2>

              <p className="mt-1 max-w-md text-sm text-[#718198]">
                {search
                  ? "Coba gunakan kata kunci pencarian yang berbeda."
                  : "Tambahkan hadiah baru agar dapat ditampilkan di katalog."}
              </p>

              {!search && (
                <Link
                  href="/admin/hadiah/add"
                  className="mt-5 flex items-center gap-2 rounded-xl bg-[#07966f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#067f5e]"
                >
                  <Plus size={18} />
                  Tambah Hadiah
                </Link>
              )}
            </div>
          ) : (
            /* CARD LIST */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredData.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-[#e3e8ef] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {/* FOTO */}
                  <div className="flex h-52 items-center justify-center overflow-hidden bg-gray-100">
                    {item.foto ? (
                      <img
                        src={getFotoUrl(item.foto)}
                        alt={item.namaHadiah}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Gift size={42} />

                        <span className="mt-2 text-xs">Tidak ada foto</span>
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    <h2 className="line-clamp-2 min-h-[48px] text-lg font-bold text-[#172b4d]">
                      {item.namaHadiah}
                    </h2>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {/* POIN */}
                      <div className="rounded-xl bg-[#e9fbf4] p-3">
                        <p className="text-xs text-[#718198]">
                          Poin Dibutuhkan
                        </p>

                        <p className="mt-1 text-base font-bold text-[#07966f]">
                          {item.poinDibutuhkan.toLocaleString("id-ID")} Pts
                        </p>
                      </div>

                      {/* STOK */}
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-[#718198]">Stok</p>

                        <p className="mt-1 text-base font-bold text-[#172b4d]">
                          {item.stok}
                        </p>
                      </div>
                    </div>

                    {/* DETAIL BUTTON */}
                    <Link
                      href={`/admin/hadiah/${item.id}`}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#07966f] px-4 py-3 text-sm font-semibold text-[#07966f] transition hover:bg-[#e9fbf4]"
                    >
                      <Eye size={17} />
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
