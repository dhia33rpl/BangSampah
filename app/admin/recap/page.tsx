"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Coins,
  DollarSign,
  Package,
  RefreshCw,
  Scale,
  ArrowLeftRight,
} from "lucide-react";
import AdminSidebar from "../../../components/AdminSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY;

type JenisSampah = {
  tonaseKg: number;
  rupiah: number;
  poin: number;
};

type Rekapitulasi = {
  periode: string;
  rekapitulasiTonase: {
    totalKg: number;
    totalTon: number;
    totalEstimasiPembayaranRupiah: number;
    totalPoinDiterbitkan: number;
  };
  breakdownJenisSampah: {
    plastik: JenisSampah;
    kertas: JenisSampah;
    logam: JenisSampah;
    kaca: JenisSampah;
  };
  rekapitulasiPenukaranPoin: {
    totalTransaksiPenukaran: number;
    totalPoinTerpakai: number;
  };
};

type ApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Rekapitulasi;
};

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("id-ID").format(value);
};

const formatPeriode = (periode: string) => {
  if (!periode) return "-";

  const [year, month] = periode.split("-");

  return new Date(Number(year), Number(month) - 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};

export default function RekapitulasiPage() {
  const router = useRouter();

  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));

  const [data, setData] = useState<Rekapitulasi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRekapitulasi = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const url = `${BASE_URL}/rekapitulasi/bulanan?bulan=${bulan}&_=${Date.now()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY || "",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data rekapitulasi.");
      }

      setData(result.data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data.",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRekapitulasi();
  }, [bulan]);

  const breakdown = data?.breakdownJenisSampah;

  return (
    <>
      <AdminSidebar />

      <main className="ml-0 min-h-screen w-full bg-[#f7f9fb] pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          {/* HEADER */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#172b4d]">
                Rekapitulasi Bulanan
              </h1>
              <p className="mt-1 text-sm text-[#718198]">
                Rekap total tonase sampah dan estimasi pembayaran setiap bulan.
              </p>
            </div>

            <button
              onClick={fetchRekapitulasi}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-xl border border-[#e3e8ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#172b4d] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* FILTER BULAN */}
          <div className="mb-6 rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#172b4d]">
                  Pilih Bulan
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#07966f]"
                  />

                  <input
                    type="month"
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    className="rounded-xl border border-[#dce3ea] bg-white py-2.5 pl-10 pr-4 text-sm text-[#172b4d] outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-[#07966f]/10"
                  />
                </div>
              </div>

              {data && (
                <div className="text-sm text-[#718198]">
                  Periode:{" "}
                  <span className="font-semibold text-[#07966f]">
                    {formatPeriode(data.periode)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-[#e3e8ef] bg-white">
              <div className="flex flex-col items-center gap-3 text-[#718198]">
                <RefreshCw size={30} className="animate-spin text-[#07966f]" />
                <p className="text-sm">Memuat rekapitulasi...</p>
              </div>
            </div>
          ) : data ? (
            <>
              {/* SUMMARY CARDS */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* TOTAL KG */}
                <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#07966f]">
                      <Scale size={22} />
                    </div>
                  </div>

                  <p className="text-sm text-[#718198]">Total Sampah</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#172b4d]">
                    {formatNumber(data.rekapitulasiTonase.totalKg)} kg
                  </h2>
                  <p className="mt-1 text-xs text-[#718198]">
                    {data.rekapitulasiTonase.totalTon} ton
                  </p>
                </div>

                {/* ESTIMASI PEMBAYARAN */}
                <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <DollarSign size={22} />
                    </div>
                  </div>

                  <p className="text-sm text-[#718198]">Estimasi Pembayaran</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#172b4d]">
                    {formatRupiah(
                      data.rekapitulasiTonase.totalEstimasiPembayaranRupiah,
                    )}
                  </h2>
                </div>

                {/* POIN DITERBITKAN */}
                <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                      <Coins size={22} />
                    </div>
                  </div>

                  <p className="text-sm text-[#718198]">Poin Diterbitkan</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#172b4d]">
                    {formatNumber(data.rekapitulasiTonase.totalPoinDiterbitkan)}
                  </h2>
                  <p className="mt-1 text-xs text-[#718198]">poin</p>
                </div>

                {/* PENUKARAN */}
                <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <ArrowLeftRight size={22} />
                    </div>
                  </div>

                  <p className="text-sm text-[#718198]">Transaksi Penukaran</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#172b4d]">
                    {formatNumber(
                      data.rekapitulasiPenukaranPoin.totalTransaksiPenukaran,
                    )}
                  </h2>
                  <p className="mt-1 text-xs text-[#718198]">
                    {formatNumber(
                      data.rekapitulasiPenukaranPoin.totalPoinTerpakai,
                    )}{" "}
                    poin terpakai
                  </p>
                </div>
              </div>

              {/* BREAKDOWN */}
              <div className="rounded-2xl border border-[#e3e8ef] bg-white shadow-sm">
                <div className="border-b border-[#e3e8ef] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9fbf4] text-[#07966f]">
                      <BarChart3 size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold text-[#172b4d]">
                        Breakdown Jenis Sampah
                      </h2>
                      <p className="text-sm text-[#718198]">
                        Rincian tonase, pembayaran, dan poin berdasarkan jenis
                        sampah.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr className="border-b border-[#e3e8ef] bg-[#f9fafb]">
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#718198]">
                          Jenis Sampah
                        </th>
                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#718198]">
                          Tonase
                        </th>
                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#718198]">
                          Estimasi Pembayaran
                        </th>
                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#718198]">
                          Poin
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {breakdown &&
                        (
                          [
                            ["plastik", breakdown.plastik],
                            ["kertas", breakdown.kertas],
                            ["logam", breakdown.logam],
                            ["kaca", breakdown.kaca],
                          ] as [string, JenisSampah][]
                        ).map(([jenis, item]) => (
                          <tr
                            key={jenis}
                            className="border-b border-[#e3e8ef] last:border-0"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-[#07966f]" />
                                <span className="font-semibold capitalize text-[#172b4d]">
                                  {jenis}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right text-sm text-[#172b4d]">
                              {formatNumber(item.tonaseKg)} kg
                            </td>

                            <td className="px-5 py-4 text-right text-sm font-semibold text-[#172b4d]">
                              {formatRupiah(item.rupiah)}
                            </td>

                            <td className="px-5 py-4 text-right text-sm text-[#172b4d]">
                              {formatNumber(item.poin)}
                            </td>
                          </tr>
                        ))}
                    </tbody>

                    <tfoot>
                      <tr className="bg-[#f9fafb]">
                        <td className="px-5 py-4 font-bold text-[#172b4d]">
                          Total
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-[#172b4d]">
                          {formatNumber(data.rekapitulasiTonase.totalKg)} kg
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-[#07966f]">
                          {formatRupiah(
                            data.rekapitulasiTonase
                              .totalEstimasiPembayaranRupiah,
                          )}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-[#172b4d]">
                          {formatNumber(
                            data.rekapitulasiTonase.totalPoinDiterbitkan,
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* PENUKARAN */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <ArrowLeftRight size={20} />
                    </div>

                    <div>
                      <p className="text-sm text-[#718198]">
                        Total Transaksi Penukaran
                      </p>
                      <p className="text-xl font-bold text-[#172b4d]">
                        {formatNumber(
                          data.rekapitulasiPenukaranPoin
                            .totalTransaksiPenukaran,
                        )}{" "}
                        transaksi
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                      <Coins size={20} />
                    </div>

                    <div>
                      <p className="text-sm text-[#718198]">
                        Total Poin Terpakai
                      </p>
                      <p className="text-xl font-bold text-[#172b4d]">
                        {formatNumber(
                          data.rekapitulasiPenukaranPoin.totalPoinTerpakai,
                        )}{" "}
                        poin
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}
