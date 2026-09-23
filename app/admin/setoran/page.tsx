"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Loader2, Search, RefreshCw } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

type Nasabah = {
  id: string;
  namaNasabah?: string;
  telp?: string;
};

type KategoriSampah = {
  id: string;
  namaKategori: string;
  jenis: string;
};

type DetailSetor = {
  id: string;
  kategoriSampahId: string;
  beratKg: number;
  subtotalPoin: number;
  kategoriSampah?: KategoriSampah;
};

type Setoran = {
  id: string;
  kodeSetor: string;
  tanggal: string;
  nasabahId: string;
  status: string;
  totalBeratKg: number;
  totalPoin: number;
  catatan?: string;
  nasabah?: Nasabah;
  detailSetors?: DetailSetor[];
};

type ApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Setoran[];
};

const statusLabel: Record<string, string> = {
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  diverifikasi: "Diverifikasi",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

const statusClass: Record<string, string> = {
  menunggu_konfirmasi: "border border-yellow-200 bg-yellow-50 text-yellow-700",
  diverifikasi: "border border-blue-200 bg-blue-50 text-blue-700",
  selesai: "border border-green-200 bg-green-50 text-green-700",
  ditolak: "border border-red-200 bg-red-50 text-red-700",
};

export default function AdminSetoranPage() {
  const [setoran, setSetoran] = useState<Setoran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("semua");

  // =========================
  // GET DATA SETORAN ADMIN
  // GET /api/v1/setor-sampah/admin/list
  // =========================
  const getData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      if (!BASE_URL) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL belum ditemukan.");
      }

      if (!APP_KEY) {
        throw new Error("NEXT_PUBLIC_APP_KEY belum ditemukan.");
      }

      /*
       * Format bulan:
       * 2026-09
       */
      const bulan = new Date().toISOString().slice(0, 7);

      /*
       * Endpoint:
       * GET /api/v1/setor-sampah/admin/list
       */
      const params = new URLSearchParams();

      /*
       * Swagger:
       * ?status=menunggu_konfirmasi&bulan=2026-08
       *
       * Status hanya dikirim kalau admin memilih
       * status tertentu.
       */
      if (status !== "semua") {
        params.set("status", status);
      }

      params.set("bulan", bulan);

      /*
       * Cache buster supaya mengambil data terbaru.
       */
      params.set("_", Date.now().toString());

      const url = `${BASE_URL}/setor-sampah/admin/list?${params.toString()}`;

      console.log("GET SETORAN ADMIN:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      console.log("RESPONSE SETORAN ADMIN:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data setoran.");
      }

      setSetoran(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("GET SETORAN ADMIN ERROR:", err);

      setError(
        err instanceof Error ? err.message : "Gagal mengambil data setoran.",
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    getData();
  }, [getData]);

  // =========================
  // FORMAT TANGGAL
  // =========================
  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // FORMAT BERAT
  // =========================
  const formatBerat = (berat: number) => {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 2,
    }).format(berat || 0);
  };

  // =========================
  // FORMAT POIN
  // =========================
  const formatPoin = (poin: number) => {
    return new Intl.NumberFormat("id-ID").format(poin || 0);
  };

  // =========================
  // SEARCH
  // =========================
  const filteredSetoran = setoran.filter((item) => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return true;

    const kodeSetor = item.kodeSetor?.toLowerCase() || "";

    const namaNasabah = item.nasabah?.namaNasabah?.toLowerCase() || "";

    return kodeSetor.includes(keyword) || namaNasabah.includes(keyword);
  });

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminSidebar />

      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* HEADER */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#172b4d]">
                Setoran Sampah
              </h1>

              <p className="mt-1 text-sm text-[#718198]">
                Kelola pengajuan setoran sampah nasabah
              </p>
            </div>

            <button
              type="button"
              onClick={getData}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-xl border border-[#e3e8ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#304563] transition hover:border-[#07966f] hover:text-[#07966f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* SEARCH + FILTER */}
          <div className="mb-6 rounded-2xl border border-[#e3e8ef] bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              {/* SEARCH */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718198]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari kode setoran atau nama nasabah..."
                  className="w-full rounded-xl border border-[#dce3ea] py-2.5 pl-10 pr-4 text-sm text-[#304563] outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-[#07966f]/10"
                />
              </div>

              {/* STATUS */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-[#dce3ea] bg-white px-4 py-2.5 text-sm text-[#304563] outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-[#07966f]/10"
              >
                <option value="semua">Semua Status</option>

                <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>

                <option value="diverifikasi">Diverifikasi</option>

                <option value="selesai">Selesai</option>

                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-[#e3e8ef] bg-white">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-[#07966f]" />

                <p className="text-sm text-[#718198]">Memuat data setoran...</p>
              </div>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="font-semibold text-red-600">Terjadi kesalahan</p>

              <p className="mt-1 text-sm text-red-500">{error}</p>

              <button
                type="button"
                onClick={getData}
                className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* DATA */}
          {!loading && !error && (
            <div className="overflow-hidden rounded-2xl border border-[#e3e8ef] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#e3e8ef] bg-[#f9fafb] text-left">
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Kode Setoran
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Nasabah
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Tanggal
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Berat
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Poin
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Status
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSetoran.length > 0 ? (
                      filteredSetoran.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#eef1f4] last:border-0 hover:bg-[#fafcfb]"
                        >
                          {/* KODE */}
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[#172b4d]">
                              {item.kodeSetor || "-"}
                            </p>
                          </td>

                          {/* NASABAH */}
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[#304563]">
                              {item.nasabah?.namaNasabah || "-"}
                            </p>

                            {item.nasabah?.telp && (
                              <p className="mt-1 text-xs text-[#718198]">
                                {item.nasabah.telp}
                              </p>
                            )}
                          </td>

                          {/* TANGGAL */}
                          <td className="px-5 py-4 text-sm text-[#304563]">
                            {formatTanggal(item.tanggal)}
                          </td>

                          {/* BERAT */}
                          <td className="px-5 py-4 text-sm font-semibold text-[#304563]">
                            {formatBerat(item.totalBeratKg)} kg
                          </td>

                          {/* POIN */}
                          <td className="px-5 py-4 text-sm font-semibold text-[#07966f]">
                            {formatPoin(item.totalPoin)} Pts
                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                                statusClass[item.status] ||
                                "border border-gray-200 bg-gray-50 text-gray-600"
                              }`}
                            >
                              {statusLabel[item.status] || item.status}
                            </span>
                          </td>

                          {/* DETAIL */}
                          <td className="px-5 py-4">
                            <div className="flex justify-center">
                              <Link
                                href={`/admin/setoran/${item.id}`}
                                title="Detail Setoran"
                                className="flex items-center gap-2 rounded-lg border border-[#dce3ea] bg-white px-3 py-2 text-xs font-semibold text-[#304563] transition hover:border-[#07966f] hover:text-[#07966f]"
                              >
                                <Eye size={16} />
                                Detail
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-12 text-center text-sm text-[#718198]"
                        >
                          Tidak ada data setoran.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}
              <div className="border-t border-[#e3e8ef] px-5 py-4">
                <p className="text-sm text-[#718198]">
                  Menampilkan{" "}
                  <span className="font-semibold text-[#304563]">
                    {filteredSetoran.length}
                  </span>{" "}
                  data setoran
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
