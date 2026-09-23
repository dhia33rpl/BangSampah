"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Gift, User, Calendar, Coins } from "lucide-react";
import AdminSidebar from "../../../../components/AdminSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY!;

interface Nasabah {
  id: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  saldoPoin: number;
  foto?: string;
}

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
  nasabahId: string;
  hadiahId: string;
  poinTerpakai: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  nasabah: Nasabah;
  hadiah: Hadiah;
}

export default function DetailPenukaranAdminPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [data, setData] = useState<Penukaran | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "diproses":
        return "Diproses";
      case "selesai":
        return "Selesai";
      case "ditolak":
        return "Ditolak";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "diproses":
        return "bg-yellow-100 text-yellow-700";
      case "selesai":
        return "bg-green-100 text-green-700";
      case "ditolak":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getFotoUrl = (foto?: string) => {
    if (!foto) return "";

    const baseFotoUrl = BASE_URL.replace(/\/api\/v1\/?$/, "");

    return `${baseFotoUrl}${foto}`;
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/penukaran-poin/nota/${id}?_=${Date.now()}`,
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
          result.message || "Gagal mengambil detail penukaran poin",
        );
      }

      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const handlePrint = () => {
    if (!data || data.status !== "selesai") return;

    window.print();
  };

  return (
    <>
      <AdminSidebar />

      <main className="ml-0 min-h-screen w-full bg-[#f7f9fb] pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="print-container mx-auto max-w-6xl p-5 md:p-8">
          {/* HEADER */}
          <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e3e8ef] bg-white text-[#718198] transition hover:bg-gray-50"
              >
                <ArrowLeft size={20} />
              </button>

              <div>
                <h1 className="text-2xl font-bold text-[#172b4d]">
                  Detail Penukaran Poin
                </h1>
                <p className="text-sm text-[#718198]">
                  Detail transaksi penukaran hadiah
                </p>
              </div>
            </div>

            {data?.status === "selesai" && (
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-xl bg-[#07966f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#067f5d]"
              >
                <Printer size={18} />
                Cetak Nota
              </button>
            )}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-2xl border border-[#e3e8ef] bg-white p-10 text-center">
              <p className="text-sm text-[#718198]">
                Memuat detail penukaran...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={fetchDetail}
                className="mt-4 rounded-xl bg-[#07966f] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* NOTA */}
          {!loading && !error && data && (
            <>
              {/* PRINT HEADER */}
              {data.status === "selesai" && (
                <div className="mb-6 hidden text-center print:block">
                  <h2 className="text-2xl font-bold text-[#172b4d]">
                    BANK SAMPAH BERSIH MANDIRI
                  </h2>
                  <p className="mt-1 text-sm text-[#718198]">
                    Nota Bukti Transaksi Penukaran Poin
                  </p>
                </div>
              )}

              <div className="print-card overflow-hidden rounded-2xl border border-[#e3e8ef] bg-white shadow-sm">
                {/* TOP */}
                <div className="border-b border-[#e3e8ef] p-6 md:p-8">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                    <div>
                      <p className="text-sm text-[#718198]">Kode Penukaran</p>

                      <h2 className="mt-1 text-2xl font-bold text-[#172b4d]">
                        {data.kodePenukaran}
                      </h2>
                    </div>

                    <span
                      className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                        data.status,
                      )}`}
                    >
                      {getStatusLabel(data.status)}
                    </span>
                  </div>
                </div>

                {/* INFORMASI TRANSAKSI */}
                <div className="grid gap-5 border-b border-[#e3e8ef] p-6 md:grid-cols-3 md:p-8">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9fbf4] text-[#07966f]">
                      <Calendar size={19} />
                    </div>

                    <div>
                      <p className="text-xs text-[#718198]">Tanggal</p>

                      <p className="mt-1 text-sm font-semibold text-[#172b4d]">
                        {new Date(data.tanggal).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>

                      <p className="text-xs text-[#718198]">
                        {new Date(data.tanggal).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        WIB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9fbf4] text-[#07966f]">
                      <Coins size={19} />
                    </div>

                    <div>
                      <p className="text-xs text-[#718198]">Poin Terpakai</p>

                      <p className="mt-1 text-lg font-bold text-[#07966f]">
                        {data.poinTerpakai.toLocaleString("id-ID")} poin
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9fbf4] text-[#07966f]">
                      <Gift size={19} />
                    </div>

                    <div>
                      <p className="text-xs text-[#718198]">Hadiah</p>

                      <p className="mt-1 text-sm font-semibold text-[#172b4d]">
                        {data.hadiah.namaHadiah}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DATA NASABAH */}
                <div className="border-b border-[#e3e8ef] p-6 md:p-8">
                  <div className="mb-5 flex items-center gap-2">
                    <User size={20} className="text-[#07966f]" />

                    <h3 className="text-lg font-bold text-[#172b4d]">
                      Data Nasabah
                    </h3>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-[#718198]">Nama Nasabah</p>

                      <p className="mt-1 text-sm font-semibold text-[#172b4d]">
                        {data.nasabah.namaNasabah}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#718198]">Nomor Telepon</p>

                      <p className="mt-1 text-sm font-semibold text-[#172b4d]">
                        {data.nasabah.telp || "-"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-xs text-[#718198]">Alamat</p>

                      <p className="mt-1 text-sm font-semibold text-[#172b4d]">
                        {data.nasabah.alamat || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#718198]">
                        Saldo Poin Saat Ini
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#07966f]">
                        {data.nasabah.saldoPoin.toLocaleString("id-ID")} poin
                      </p>
                    </div>
                  </div>
                </div>

                {/* DETAIL HADIAH */}
                <div className="border-b border-[#e3e8ef] p-6 md:p-8">
                  <h3 className="mb-5 text-lg font-bold text-[#172b4d]">
                    Detail Hadiah
                  </h3>

                  <div className="flex flex-col gap-5 rounded-2xl bg-[#f7f9fb] p-5 sm:flex-row sm:items-center">
                    {data.hadiah.foto && (
                      <img
                        src={getFotoUrl(data.hadiah.foto)}
                        alt={data.hadiah.namaHadiah}
                        className="h-24 w-24 rounded-xl object-cover"
                      />
                    )}

                    <div className="flex-1">
                      <p className="text-lg font-bold text-[#172b4d]">
                        {data.hadiah.namaHadiah}
                      </p>

                      <p className="mt-1 text-sm text-[#718198]">
                        {data.hadiah.poinDibutuhkan.toLocaleString("id-ID")}{" "}
                        poin
                      </p>

                      <p className="mt-2 text-xs text-[#718198]">
                        Stok tersisa: {data.hadiah.stok}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-[#718198]">Poin Terpakai</p>

                      <p className="text-xl font-bold text-[#07966f]">
                        {data.poinTerpakai.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* TOTAL */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between rounded-2xl bg-[#e9fbf4] p-5">
                    <div>
                      <p className="text-sm text-[#718198]">
                        Total Poin Digunakan
                      </p>

                      <p className="mt-1 text-xl font-bold text-[#172b4d]">
                        Penukaran Poin
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-[#07966f]">
                      {data.poinTerpakai.toLocaleString("id-ID")} poin
                    </p>
                  </div>
                </div>
              </div>

              {/* PRINT FOOTER */}
              {data.status === "selesai" && (
                <div className="hidden pt-8 text-center print:block">
                  <p className="text-sm text-[#718198]">
                    Terima kasih telah menggunakan layanan
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#172b4d]">
                    Bank Sampah Bersih Mandiri
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            background: white !important;
          }

          aside,
          header,
          nav,
          .no-print {
            display: none !important;
          }

          main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: auto !important;
          }

          .print-container {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
          }

          .print-card {
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </>
  );
}
