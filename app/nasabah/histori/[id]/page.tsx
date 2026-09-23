"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, Printer } from "lucide-react";
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
  kodeSetor: string;
  tanggal: string;
  status: string;
  totalBeratKg: number;
  totalPoin: number;
  catatan?: string;
  detailSetors?: DetailSetor[];
};

type ApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Setoran;
};

const statusLabel: Record<string, string> = {
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  diverifikasi: "Diverifikasi",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

const statusClass: Record<string, string> = {
  menunggu_konfirmasi: "bg-[#fff5df] text-[#a66b00]",
  diverifikasi: "bg-[#eef5ff] text-[#3974c6]",
  selesai: "bg-[#e9fbf4] text-[#008563]",
  ditolak: "bg-[#fff0f0] text-[#d64545]",
};

function formatTanggal(tanggal: string) {
  if (!tanggal) return "-";

  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DetailHistoriPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [data, setData] = useState<Setoran | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Token login tidak ditemukan.");
          return;
        }

        if (!id) {
          setError("ID setoran tidak ditemukan.");
          return;
        }

        const response = await fetch(
          `${BASE_URL}/setor-sampah/${id}?_=${Date.now()}`,
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
          throw new Error(result.message || "Gagal mengambil detail setoran.");
        }

        setData(result.data);
      } catch (err) {
        console.error("GET DETAIL SETORAN ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil detail setoran.",
        );
      } finally {
        setLoading(false);
      }
    };

    getDetail();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <NasabahSidebar />

      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* HEADER */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <div>
              <button
                type="button"
                onClick={() => router.back()}
                className="mb-3 flex items-center gap-2 text-sm font-medium text-[#718198] hover:text-[#07966f]"
              >
                <ArrowLeft size={18} />
                Kembali
              </button>

              <h1 className="text-2xl font-bold text-[#172b4d] sm:text-3xl">
                Nota Penyetoran Sampah
              </h1>

              <p className="mt-1 text-sm text-[#718198]">
                Bukti transaksi penyetoran sampah.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#07966f] px-5 text-sm font-semibold text-white hover:bg-[#067e5e]"
            >
              <Printer size={18} />
              Cetak Nota
            </button>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-2xl border border-[#e3e8ef] bg-white p-10 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#d9f3eb] border-t-[#07966f]" />
              <p className="text-sm text-[#718198]">Memuat nota...</p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-2xl border border-[#ffd4d4] bg-white p-6">
              <p className="font-semibold text-[#d64545]">
                Gagal mengambil nota
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

          {/* NOTA */}
          {!loading && !error && data && (
            <div className="mx-auto max-w-4xl rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm sm:p-8">
              {/* JUDUL NOTA */}
              <div className="flex flex-col gap-4 border-b border-[#e3e8ef] pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#07966f] text-white">
                    <FileText size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#172b4d]">
                      Bank Sampah Bersih Mandiri
                    </h2>

                    <p className="text-sm text-[#718198]">
                      Bukti Penyetoran Sampah
                    </p>
                  </div>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs text-[#718198]">Kode Setoran</p>
                  <p className="mt-1 font-bold text-[#172b4d]">
                    {data.kodeSetor}
                  </p>
                </div>
              </div>

              {/* INFORMASI */}
              <div className="grid grid-cols-1 gap-4 border-b border-[#e3e8ef] py-6 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-[#718198]">Tanggal</p>

                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#304563]">
                    <CalendarDays size={16} />
                    {formatTanggal(data.tanggal)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#718198]">Status</p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass[data.status] || "bg-gray-100 text-gray-600"}`}
                  >
                    {statusLabel[data.status] || data.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-[#718198]">Total Berat</p>
                  <p className="mt-1 text-sm font-bold text-[#304563]">
                    {data.totalBeratKg} kg
                  </p>
                </div>
              </div>

              {/* DETAIL SAMPAH */}
              <div className="py-6">
                <h3 className="mb-4 font-bold text-[#172b4d]">Detail Sampah</h3>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#e3e8ef] text-left">
                        <th className="pb-3 text-xs font-semibold text-[#718198]">
                          Jenis Sampah
                        </th>
                        <th className="pb-3 text-right text-xs font-semibold text-[#718198]">
                          Harga / Kg
                        </th>
                        <th className="pb-3 text-right text-xs font-semibold text-[#718198]">
                          Berat
                        </th>
                        <th className="pb-3 text-right text-xs font-semibold text-[#718198]">
                          Poin
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.detailSetors?.map((detail) => (
                        <tr
                          key={detail.id}
                          className="border-b border-[#f0f2f5]"
                        >
                          <td className="py-4">
                            <p className="font-semibold text-[#304563]">
                              {detail.kategoriSampah?.namaKategori || "-"}
                            </p>

                            <p className="mt-1 text-xs capitalize text-[#718198]">
                              {detail.kategoriSampah?.jenis || "-"}
                            </p>
                          </td>

                          <td className="py-4 text-right text-sm text-[#304563]">
                            {formatRupiah(
                              detail.kategoriSampah?.hargaPerKg || 0,
                            )}
                          </td>

                          <td className="py-4 text-right text-sm font-medium text-[#304563]">
                            {detail.beratKg} kg
                          </td>

                          <td className="py-4 text-right text-sm font-bold text-[#07966f]">
                            +{detail.subtotalPoin} Pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TOTAL */}
              <div className="border-t border-[#e3e8ef] pt-5">
                <div className="ml-auto max-w-sm space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#718198]">Total Berat</span>
                    <span className="font-semibold text-[#304563]">
                      {data.totalBeratKg} kg
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-[#e9fbf4] p-4">
                    <span className="font-semibold text-[#304563]">
                      Total Poin
                    </span>
                    <span className="text-xl font-bold text-[#07966f]">
                      +{data.totalPoin} Pts
                    </span>
                  </div>
                </div>
              </div>

              {/* CATATAN */}
              {data.catatan && (
                <div className="mt-6 rounded-xl bg-[#f7f9fb] p-4">
                  <p className="text-xs font-semibold text-[#718198]">
                    Catatan
                  </p>
                  <p className="mt-1 text-sm text-[#304563]">{data.catatan}</p>
                </div>
              )}

              {/* FOOTER */}
              <div className="mt-8 border-t border-[#e3e8ef] pt-5 text-center">
                <p className="text-xs text-[#9aa8b8]">
                  Terima kasih telah berkontribusi dalam menjaga lingkungan.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* PRINT STYLE */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          aside,
          header {
            display: none !important;
          }

          main {
            margin: 0 !important;
            padding-top: 0 !important;
            width: 100% !important;
          }

          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
