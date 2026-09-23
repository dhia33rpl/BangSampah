"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Gift,
  Receipt,
  RefreshCw,
  Search,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import NasabahSidebar from "../../../components/NasabahSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY;

interface Hadiah {
  id: string;
  namaHadiah: string;
  poinDibutuhkan: number;
  stok: number;
  foto?: string;
}

interface Penukaran {
  id: string;
  kodePenukaran: string;
  tanggal: string;
  poinTerpakai: number;
  status: string;
  hadiah: Hadiah;
}

export default function RiwayatPenukaranPage() {
  const router = useRouter();

  const [data, setData] = useState<Penukaran[]>([]);
  const [filteredData, setFilteredData] = useState<Penukaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");

  const getFotoUrl = (foto?: string) => {
    if (!foto || !BASE_URL) return "";

    const baseFotoUrl = BASE_URL.replace(/\/api\/v1\/?$/, "");

    return `${baseFotoUrl}${foto}`;
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatJam = (tanggal: string) => {
    return new Date(tanggal).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "diproses":
        return "Diproses";
      case "selesai":
        return "Selesai";
      case "dibatalkan":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "selesai":
        return "bg-green-50 text-green-700 border-green-200";

      case "diproses":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "dibatalkan":
        return "bg-red-50 text-red-600 border-red-200";

      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "selesai":
        return <CheckCircle2 size={15} />;

      case "dibatalkan":
        return <XCircle size={15} />;

      default:
        return <Clock3 size={15} />;
    }
  };

  const fetchRiwayatPenukaran = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      if (!BASE_URL || !APP_KEY) {
        setError("Konfigurasi API belum ditemukan.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/penukaran-poin/my-penukaran?_=${Date.now()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "x-app-key": APP_KEY,
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mengambil histori penukaran poin.",
        );
      }

      const penukaranData = Array.isArray(result.data) ? result.data : [];

      setData(penukaranData);
      setFilteredData(penukaranData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil histori.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayatPenukaran();
  }, []);

  useEffect(() => {
    let result = [...data];

    if (search.trim()) {
      const keyword = search.toLowerCase();

      result = result.filter(
        (item) =>
          item.kodePenukaran.toLowerCase().includes(keyword) ||
          item.hadiah?.namaHadiah?.toLowerCase().includes(keyword),
      );
    }

    if (statusFilter !== "semua") {
      result = result.filter((item) => item.status === statusFilter);
    }

    setFilteredData(result);
  }, [search, statusFilter, data]);

  // Hanya transaksi yang sudah diselesaikan admin yang boleh membuka nota
  const handleNota = (item: Penukaran) => {
    if (item.status !== "selesai") {
      return;
    }

    router.push(`/nasabah/riwayattukarhadiah/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <NasabahSidebar />

      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
          {/* HEADER */}
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#172b4d]">
                Riwayat Penukaran
              </h1>

              <p className="mt-1 text-sm text-[#718198]">
                Lihat riwayat penukaran poin dan bukti transaksi kamu.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchRiwayatPenukaran}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#e3e8ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#304563] transition hover:bg-[#f5f7f9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* FILTER */}
          <div className="mb-6 rounded-2xl border border-[#e3e8ef] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7b8]"
                />

                <input
                  type="text"
                  placeholder="Cari kode transaksi atau nama hadiah..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#e3e8ef] bg-white pl-10 pr-4 text-sm text-[#172b4d] outline-none transition placeholder:text-[#9aa7b8] focus:border-[#07966f]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 rounded-xl border border-[#e3e8ef] bg-white px-4 text-sm text-[#304563] outline-none focus:border-[#07966f]"
              >
                <option value="semua">Semua Status</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-2xl border border-[#e3e8ef] bg-white py-16 text-center shadow-sm">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#e9fbf4] border-t-[#07966f]" />

              <p className="text-sm text-[#718198]">
                Memuat riwayat penukaran...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
              <p className="font-semibold text-red-600">{error}</p>

              <button
                onClick={fetchRiwayatPenukaran}
                className="mt-5 rounded-xl bg-[#07966f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#067f5e]"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && filteredData.length === 0 && (
            <div className="rounded-2xl border border-[#e3e8ef] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9fbf4]">
                <Gift size={27} className="text-[#07966f]" />
              </div>

              <h3 className="mt-4 font-bold text-[#172b4d]">
                Belum Ada Riwayat Penukaran
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-[#718198]">
                Riwayat penukaran poin kamu akan muncul di halaman ini.
              </p>
            </div>
          )}

          {/* LIST */}
          {!loading && !error && filteredData.length > 0 && (
            <div className="space-y-4">
              {filteredData.map((item) => {
                const isApproved = item.status === "selesai";

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* LEFT */}
                      <div className="flex min-w-0 gap-4">
                        {/* FOTO */}
                        {item.hadiah?.foto ? (
                          <img
                            src={getFotoUrl(item.hadiah.foto)}
                            alt={item.hadiah.namaHadiah}
                            className="h-20 w-20 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#e9fbf4]">
                            <Gift size={28} className="text-[#07966f]" />
                          </div>
                        )}

                        {/* INFO */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-bold text-[#172b4d]">
                              {item.hadiah?.namaHadiah || "Hadiah"}
                            </h3>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                                item.status,
                              )}`}
                            >
                              {getStatusIcon(item.status)}
                              {getStatusLabel(item.status)}
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-medium text-[#718198]">
                            {item.kodePenukaran}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#718198]">
                            <span>
                              {formatTanggal(item.tanggal)} ·{" "}
                              {formatJam(item.tanggal)}
                            </span>

                            <span className="font-semibold text-[#07966f]">
                              {item.poinTerpakai} Poin
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* BUTTON */}
                      <div className="flex shrink-0">
                        {isApproved ? (
                          <button
                            type="button"
                            onClick={() => handleNota(item)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#07966f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#067f5e] lg:w-auto"
                          >
                            <Receipt size={17} />
                            Nota
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#e3e8ef] bg-[#f7f9fb] px-5 py-2.5 text-sm font-semibold text-[#9aa7b8] lg:w-auto"
                          >
                            {item.status === "diproses" ? (
                              <Clock3 size={17} />
                            ) : (
                              <XCircle size={17} />
                            )}

                            {item.status === "diproses"
                              ? "Menunggu Konfirmasi"
                              : "Nota Tidak Tersedia"}
                          </button>
                        )}
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
