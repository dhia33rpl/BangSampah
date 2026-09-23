"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Eye, FileText, Search } from "lucide-react";
import NasabahSidebar from "../../../components/NasabahSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

type Status = "menunggu_konfirmasi" | "diverifikasi" | "selesai" | "ditolak";

type KategoriSampah = {
  id: string;
  namaKategori: string;
  hargaPerKg: number;
  poinPerKg: number;
  jenis: string;
  foto?: string;
};

type DetailSetor = {
  id: string;
  setorId: string;
  kategoriSampahId: string;
  beratKg: number;
  subtotalPoin: number;
  kategoriSampah?: KategoriSampah;
};

type Riwayat = {
  id: string;
  kodeSetor: string;
  tanggal: string;
  status: Status;
  totalBeratKg: number;
  totalPoin: number;
  catatan?: string;
  detailSetors?: DetailSetor[];
};

type ApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Riwayat[];
};

const statusLabel: Record<Status, string> = {
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  diverifikasi: "Diverifikasi",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

const statusClass: Record<Status, string> = {
  menunggu_konfirmasi: "bg-[#fff5df] text-[#a66b00]",
  diverifikasi: "bg-[#eef5ff] text-[#3974c6]",
  selesai: "bg-[#e9fbf4] text-[#008563]",
  ditolak: "bg-[#fff0f0] text-[#d64545]",
};

const bulanOptions = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatTanggal(tanggal: string) {
  if (!tanggal) return "-";

  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatBulan(value: string) {
  const [tahun, bulan] = value.split("-");

  if (!tahun || !bulan) return value;

  return `${bulanOptions[Number(bulan) - 1]} ${tahun}`;
}

export default function HistoriPage() {
  const sekarang = new Date();

  const [bulan, setBulan] = useState(
    `${sekarang.getFullYear()}-${String(sekarang.getMonth() + 1).padStart(
      2,
      "0",
    )}`,
  );

  const [data, setData] = useState<Riwayat[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getHistori = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Token login tidak ditemukan.");
          setData([]);
          return;
        }

        const response = await fetch(
          `${BASE_URL}/setor-sampah/my-setor?bulan=${bulan}&_=${Date.now()}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
              "x-app-key": APP_KEY,
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
            },
          },
        );

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil histori setoran.");
        }

        setData(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error("GET HISTORI ERROR:", err);
        setData([]);

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil histori setoran.",
        );
      } finally {
        setLoading(false);
      }
    };

    getHistori();
  }, [bulan]);

  const filteredData = data
    .filter((item) => {
      const keyword = search.toLowerCase().trim();

      if (!keyword) return true;

      const cocokKode = item.kodeSetor?.toLowerCase().includes(keyword);

      const cocokStatus = statusLabel[item.status]
        ?.toLowerCase()
        .includes(keyword);

      const cocokJenis = item.detailSetors?.some((detail) =>
        detail.kategoriSampah?.namaKategori?.toLowerCase().includes(keyword),
      );

      return cocokKode || cocokStatus || cocokJenis;
    })
    .filter((item) => filterStatus === "Semua" || item.status === filterStatus);

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <NasabahSidebar />

      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#172b4d] sm:text-3xl">
              Histori & Status Setoran
            </h1>

            <p className="mt-1 text-sm text-[#718198]">
              Lihat riwayat dan status penyetoran sampah kamu.
            </p>
          </div>

          {/* FILTER */}
          <div className="mb-6 rounded-2xl border border-[#e3e8ef] bg-white p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_190px]">
              {/* BULAN */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#718198]">
                  Histori Per Bulan
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa8b8]"
                  />

                  <input
                    type="month"
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#dfe5eb] bg-white pl-10 pr-4 text-sm text-[#304563] outline-none focus:border-[#07966f]"
                  />
                </div>
              </div>

              {/* SEARCH */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#718198]">
                  Cari Histori
                </label>

                <div className="relative">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa8b8]"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari kode atau jenis sampah..."
                    className="h-11 w-full rounded-xl border border-[#dfe5eb] bg-white pl-10 pr-4 text-sm text-[#304563] outline-none focus:border-[#07966f]"
                  />
                </div>
              </div>

              {/* STATUS */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#718198]">
                  Status
                </label>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#dfe5eb] bg-white px-4 text-sm text-[#304563] outline-none focus:border-[#07966f]"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="menunggu_konfirmasi">
                    Menunggu Konfirmasi
                  </option>
                  <option value="diverifikasi">Diverifikasi</option>
                  <option value="selesai">Selesai</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-[#718198]">
              <CalendarDays size={16} />

              <span>
                Menampilkan histori bulan{" "}
                <span className="font-semibold text-[#304563]">
                  {formatBulan(bulan)}
                </span>
              </span>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-2xl border border-[#e3e8ef] bg-white p-10 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#d9f3eb] border-t-[#07966f]" />

              <p className="text-sm text-[#718198]">
                Memuat histori setoran...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-2xl border border-[#ffd4d4] bg-white p-6">
              <p className="font-semibold text-[#d64545]">
                Gagal mengambil histori
              </p>

              <p className="mt-1 text-sm text-[#718198]">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-[#07966f] px-4 py-2 text-sm font-medium text-white hover:bg-[#067e5e]"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && filteredData.length === 0 && (
            <div className="rounded-2xl border border-[#e3e8ef] bg-white p-10 text-center">
              <FileText size={42} className="mx-auto mb-3 text-[#b4c0cc]" />

              <p className="font-semibold text-[#304563]">
                Tidak ada histori setoran
              </p>

              <p className="mt-1 text-sm text-[#718198]">
                Tidak ditemukan setoran pada bulan {formatBulan(bulan)}.
              </p>
            </div>
          )}

          {/* LIST */}
          {!loading && !error && filteredData.length > 0 && (
            <div className="space-y-4">
              {filteredData.map((item) => {
                const jumlahJenis = item.detailSetors?.length || 0;

                // NOTA HANYA BOLEH UNTUK STATUS SELESAI
                const bisaCetakNota = item.status === "selesai";

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#e3e8ef] bg-white p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="break-all font-bold text-[#172b4d]">
                            {item.kodeSetor}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass[item.status]}`}
                          >
                            {statusLabel[item.status]}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#718198]">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={16} />
                            {formatTanggal(item.tanggal)}
                          </span>
                        </div>
                      </div>

                      {/* BUTTON */}
                      <div className="flex w-full gap-2 sm:w-auto">
                        {/* DETAIL */}
                        <Link
                          href={`/nasabah/histori/${item.id}`}
                          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#dfe5eb] px-4 text-sm font-medium text-[#304563] hover:bg-[#f5f7f9] sm:flex-none"
                        >
                          <Eye size={17} />
                          <span>Detail</span>
                        </Link>

                        {/* NOTA */}
                        {bisaCetakNota ? (
                          <Link
                            href={`/nasabah/histori/${item.id}`}
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#07966f] px-4 text-sm font-medium text-white hover:bg-[#067e5e] sm:flex-none"
                          >
                            <FileText size={17} />
                            <span>Nota</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="flex h-10 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#eef1f4] px-4 text-sm font-medium text-[#9aa8b8] sm:flex-none"
                            title="Nota hanya tersedia setelah setoran selesai"
                          >
                            <FileText size={17} />

                            <span>
                              {item.status === "ditolak"
                                ? "Nota Tidak Tersedia"
                                : "Belum Selesai"}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* INFO */}
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-[#f7f9fb] p-3">
                        <p className="text-xs text-[#718198]">Total Berat</p>

                        <p className="mt-1 font-bold text-[#172b4d]">
                          {item.totalBeratKg} kg
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f7f9fb] p-3">
                        <p className="text-xs text-[#718198]">Total Poin</p>

                        <p className="mt-1 font-bold text-[#07966f]">
                          +{item.totalPoin} Pts
                        </p>
                      </div>

                      <div className="col-span-2 rounded-xl bg-[#f7f9fb] p-3 sm:col-span-1">
                        <p className="text-xs text-[#718198]">Jenis Sampah</p>

                        <p className="mt-1 font-bold text-[#172b4d]">
                          {jumlahJenis} jenis
                        </p>
                      </div>
                    </div>

                    {/* CATATAN */}
                    {item.catatan && (
                      <div className="mt-4 rounded-xl bg-[#f7f9fb] p-3">
                        <p className="text-xs text-[#718198]">Catatan</p>

                        <p className="mt-1 text-sm text-[#304563]">
                          {item.catatan}
                        </p>
                      </div>
                    )}
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
