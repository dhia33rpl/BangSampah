"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Coins, Gift, Package, Search } from "lucide-react";
import NasabahSidebar from "../../../components/NasabahSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY!;

type Hadiah = {
  id: string;
  appMakerId: string;
  namaHadiah: string;
  poinDibutuhkan: number;
  stok: number;
  foto: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Hadiah[];
};

const getFotoUrl = (foto?: string) => {
  if (!foto) return "";

  const baseFotoUrl = BASE_URL.replace(/\/api\/v1\/?$/, "");

  return `${baseFotoUrl}${foto}`;
};

export default function HadiahPage() {
  const [hadiah, setHadiah] = useState<Hadiah[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHadiah = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Silakan login terlebih dahulu.");
          return;
        }

        const response = await fetch(`${BASE_URL}/hadiah?_=${Date.now()}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "x-app-key": APP_KEY,
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil data hadiah.");
        }

        setHadiah(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchHadiah();
  }, []);

  const filteredHadiah = hadiah.filter((item) =>
    item.namaHadiah.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <NasabahSidebar />

      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="p-5 md:p-8">
          <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/nasabah/dashboard"
                className="rounded-lg p-2 transition hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </Link>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tukar Poin</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Pilih hadiah yang ingin kamu tukarkan dengan poin.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
            <div className="relative max-w-md">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Cari hadiah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#07966f] focus:ring-1 focus:ring-[#07966f]"
              />
            </div>
          </div>

          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-gray-500">Memuat katalog hadiah...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && filteredHadiah.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <Gift size={45} className="mx-auto mb-3 text-gray-300" />

              <p className="font-medium text-gray-700">
                {search
                  ? "Hadiah tidak ditemukan."
                  : "Belum ada hadiah tersedia."}
              </p>
            </div>
          )}

          {!loading && !error && filteredHadiah.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredHadiah.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-48 items-center justify-center bg-gray-100">
                    {item.foto ? (
                      <img
                        src={getFotoUrl(item.foto)}
                        alt={item.namaHadiah}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Gift size={60} className="text-gray-300" />
                    )}
                  </div>

                  <div className="p-5">
                    <h2 className="min-h-[48px] line-clamp-2 font-semibold text-gray-900">
                      {item.namaHadiah}
                    </h2>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[#07966f]">
                        <Coins size={18} />

                        <span className="font-bold">
                          {item.poinDibutuhkan} Pts
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Package size={16} />

                        <span>Stok {item.stok}</span>
                      </div>
                    </div>

                    <Link
                      href={`/nasabah/hadiah/${item.id}`}
                      className="mt-5 block w-full rounded-xl bg-[#07966f] py-3 text-center font-semibold text-white transition hover:bg-[#067d5d]"
                    >
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
