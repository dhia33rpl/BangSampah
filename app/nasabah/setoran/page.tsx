"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Eye,
  Loader2,
  Plus,
  Recycle,
  Scale,
  Search,
} from "lucide-react";
import NasabahSidebar from "../../../components/NasabahSidebar";

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

type DetailSetor = {
  id: string;
  setorId: string;
  kategoriSampahId: string;
  beratKg: number;
  subtotalPoin: number;
  kategoriSampah?: KategoriSampah;
};

type Setoran = {
  id: string;
  appMakerId: string;
  kodeSetor: string;
  tanggal: string;
  nasabahId: string;
  status: string;
  totalBeratKg: number;
  totalPoin: number;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
  detailSetors: DetailSetor[];
};

type ApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Setoran[];
};

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  menunggu_konfirmasi: {
    label: "Menunggu Konfirmasi",
    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
  },

  diverifikasi: {
    label: "Diverifikasi",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
};

export default function NasabahSetoranPage() {
  const router = useRouter();

  const [setoran, setSetoran] = useState<Setoran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [bulan, setBulan] = useState(() => {
    const sekarang = new Date();
    const tahun = sekarang.getFullYear();
    const month = String(sekarang.getMonth() + 1).padStart(2, "0");

    return `${tahun}-${month}`;
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      if (!APP_KEY) {
        throw new Error("App Key belum ditemukan.");
      }

      if (!BASE_URL) {
        throw new Error("API Base URL belum ditemukan.");
      }

      const url =
        `${BASE_URL}/setor-sampah/my-setor` +
        `?bulan=${encodeURIComponent(bulan)}` +
        `&_=${Date.now()}`;

      console.log("GET SETORAN AKTIF:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      console.log("RESPONSE SETORAN AKTIF:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data setoran.");
      }

      const dataAktif = (Array.isArray(result.data) ? result.data : []).filter(
        (item) =>
          item.status === "menunggu_konfirmasi" ||
          item.status === "diverifikasi",
      );

      setSetoran(dataAktif);
    } catch (err) {
      console.error("Error get setoran:", err);

      setSetoran([]);

      setError(
        err instanceof Error ? err.message : "Gagal mengambil data setoran.",
      );
    } finally {
      setLoading(false);
    }
  }, [bulan, router]);

  useEffect(() => {
    getData();
  }, [getData]);

  const filteredSetoran = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return setoran;
    }

    return setoran.filter((item) => {
      const cocokKode = item.kodeSetor?.toLowerCase().includes(keyword);

      const cocokStatus = item.status?.toLowerCase().includes(keyword);

      const cocokCatatan = item.catatan?.toLowerCase().includes(keyword);

      const cocokKategori = item.detailSetors?.some(
        (detail) =>
          detail.kategoriSampah?.namaKategori
            ?.toLowerCase()
            .includes(keyword) ||
          detail.kategoriSampah?.jenis?.toLowerCase().includes(keyword),
      );

      return cocokKode || cocokStatus || cocokCatatan || cocokKategori;
    });
  }, [setoran, search]);

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

  const getStatus = (status: string) => {
    return (
      statusConfig[status] || {
        label: status.replace(/_/g, " "),
        className: "border-gray-200 bg-gray-50 text-gray-600",
      }
    );
  };

  const toggleDetail = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <NasabahSidebar />

      <main className="ml-[278px] min-h-screen w-[calc(100%-278px)] pt-[88px]">
        <div className="w-full px-8 py-8 lg:px-10 xl:px-12">
          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9fbf4]">
                  <Recycle size={24} className="text-[#008563]" />
                </div>

                <h1 className="text-2xl font-bold text-[#172b4d]">
                  Setoran Saya
                </h1>
              </div>

              <p className="text-sm text-[#718198]">
                Lihat pengajuan setoran yang sedang diproses oleh admin.
              </p>
            </div>

            {/* TAMBAH SETORAN */}
            <button
              type="button"
              onClick={() => router.push("/nasabah/setoran/add")}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#07966f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#067f5e]"
            >
              <Plus size={18} />
              Tambah Setoran
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* FILTER */}
          <div className="mb-6 rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* SEARCH */}
              <div className="relative">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#718198]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari kode setoran atau kategori..."
                  className="w-full rounded-xl border border-[#e3e8ef] bg-white py-3.5 pl-11 pr-4 text-sm text-[#172b4d] outline-none transition placeholder:text-[#718198] focus:border-[#07966f] focus:ring-2 focus:ring-[#e9fbf4]"
                />
              </div>

              {/* BULAN */}
              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#718198]"
                />

                <input
                  type="month"
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                  className="w-full rounded-xl border border-[#e3e8ef] bg-white py-3.5 pl-11 pr-4 text-sm text-[#172b4d] outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-[#e9fbf4]"
                />
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-[#e3e8ef] bg-white shadow-sm">
              <div className="flex items-center gap-3 text-sm text-[#718198]">
                <Loader2 size={22} className="animate-spin text-[#07966f]" />
                Memuat data setoran...
              </div>
            </div>
          ) : filteredSetoran.length === 0 ? (
            /* EMPTY */
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-[#e3e8ef] bg-white px-6 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9fbf4]">
                <Recycle size={30} className="text-[#008563]" />
              </div>

              <h2 className="text-lg font-bold text-[#172b4d]">
                Tidak ada setoran aktif
              </h2>

              <p className="mt-2 max-w-md text-sm text-[#718198]">
                Belum ada pengajuan setoran yang sedang diproses oleh admin.
              </p>

              <button
                type="button"
                onClick={() => router.push("/nasabah/setoran/add")}
                className="mt-5 flex items-center gap-2 rounded-xl bg-[#07966f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#067f5e]"
              >
                <Plus size={17} />
                Tambah Setoran
              </button>
            </div>
          ) : (
            /* LIST SETORAN */
            <div className="space-y-4">
              {filteredSetoran.map((item) => {
                const status = getStatus(item.status);
                const isExpanded = expandedId === item.id;

                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-[#e3e8ef] bg-white shadow-sm"
                  >
                    {/* CARD HEADER */}
                    <div className="p-5">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        {/* KODE + TANGGAL */}
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e9fbf4]">
                            <Recycle size={23} className="text-[#008563]" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h2 className="text-base font-bold text-[#172b4d]">
                                {item.kodeSetor}
                              </h2>

                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#718198]">
                              <span className="flex items-center gap-1.5">
                                <CalendarDays size={15} />
                                {formatTanggal(item.tanggal)}
                              </span>

                              <span>{formatJam(item.tanggal)}</span>
                            </div>
                          </div>
                        </div>

                        {/* TOTAL */}
                        <div className="flex flex-wrap items-end gap-5">
                          <div>
                            <p className="text-xs text-[#718198]">
                              Total Berat
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-[#172b4d]">
                              <Scale size={16} className="text-[#07966f]" />
                              {item.totalBeratKg} kg
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-[#718198]">
                              Estimasi Poin
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#008563]">
                              {item.totalPoin} poin
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleDetail(item.id)}
                            className="flex h-10 items-center gap-2 rounded-xl bg-[#e9fbf4] px-4 text-sm font-semibold text-[#008563] transition hover:bg-[#d9f6ec]"
                          >
                            <Eye size={17} />
                            Detail
                            {isExpanded ? (
                              <ArrowUp size={16} />
                            ) : (
                              <ArrowDown size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* DETAIL */}
                    {isExpanded && (
                      <div className="border-t border-[#e3e8ef] bg-[#f7f9fb] p-5">
                        {/* DETAIL SAMPAH */}
                        <div className="mb-5">
                          <h3 className="mb-3 text-sm font-bold text-[#172b4d]">
                            Detail Sampah
                          </h3>

                          <div className="overflow-x-auto rounded-xl border border-[#e3e8ef] bg-white">
                            <table className="w-full min-w-[650px]">
                              <thead>
                                <tr className="bg-[#f7f9fb]">
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#718198]">
                                    Kategori
                                  </th>

                                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#718198]">
                                    Jenis
                                  </th>

                                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#718198]">
                                    Harga / Kg
                                  </th>

                                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#718198]">
                                    Berat
                                  </th>

                                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#718198]">
                                    Poin
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {item.detailSetors?.map((detail) => (
                                  <tr
                                    key={detail.id}
                                    className="border-t border-[#e3e8ef]"
                                  >
                                    <td className="px-4 py-4 text-sm font-medium text-[#172b4d]">
                                      {detail.kategoriSampah?.namaKategori ||
                                        "-"}
                                    </td>

                                    <td className="px-4 py-4 text-sm capitalize text-[#718198]">
                                      {detail.kategoriSampah?.jenis || "-"}
                                    </td>

                                    <td className="px-4 py-4 text-sm text-[#718198]">
                                      Rp{" "}
                                      {Number(
                                        detail.kategoriSampah?.hargaPerKg || 0,
                                      ).toLocaleString("id-ID")}
                                    </td>

                                    <td className="px-4 py-4 text-sm font-semibold text-[#172b4d]">
                                      {detail.beratKg} kg
                                    </td>

                                    <td className="px-4 py-4 text-sm font-semibold text-[#008563]">
                                      {detail.subtotalPoin} poin
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* CATATAN */}
                        {item.catatan && (
                          <div className="rounded-xl border border-[#d5f1e6] bg-[#e9fbf4] p-4">
                            <p className="text-xs font-semibold text-[#008563]">
                              Catatan
                            </p>

                            <p className="mt-1 text-sm text-[#075c47]">
                              {item.catatan}
                            </p>
                          </div>
                        )}

                        {/* STATUS */}
                        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                          <p className="text-xs font-semibold text-blue-700">
                            Status Pengajuan
                          </p>

                          <p className="mt-1 text-sm text-blue-800">
                            {item.status === "menunggu_konfirmasi"
                              ? "Pengajuan kamu sedang menunggu konfirmasi dan penimbangan dari admin."
                              : "Pengajuan kamu sudah diverifikasi admin dan sedang diproses lebih lanjut."}
                          </p>
                        </div>
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
