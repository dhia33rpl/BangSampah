"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Gift,
  MapPin,
  Phone,
  Printer,
  Recycle,
  User,
} from "lucide-react";
import NasabahSidebar from "../../../../components/NasabahSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY;

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

interface Nota {
  id: string;
  kodePenukaran: string;
  tanggal: string;
  nasabahId: string;
  hadiahId: string;
  poinTerpakai: number;
  status: string;
  nasabah: Nasabah;
  hadiah: Hadiah;
}

export default function NotaPenukaranPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [nota, setNota] = useState<Nota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    if (status === "diproses") return "Diproses";
    if (status === "selesai") return "Selesai";
    if (status === "dibatalkan") return "Dibatalkan";

    return status;
  };

  const getStatusStyle = (status: string) => {
    if (status === "selesai") {
      return "border-green-200 bg-green-50 text-green-700";
    }

    if (status === "dibatalkan") {
      return "border-red-200 bg-red-50 text-red-600";
    }

    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  };

  const fetchNota = async () => {
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
          result.message || "Gagal mengambil nota penukaran poin.",
        );
      }

      setNota(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil nota.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchNota();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <NasabahSidebar />

        <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
          <div className="flex min-h-[calc(100vh-88px)] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#e9fbf4] border-t-[#07966f]" />

              <p className="text-sm text-[#718198]">Memuat nota...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !nota) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <NasabahSidebar />

        <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
          <div className="mx-auto max-w-4xl px-5 py-8 lg:px-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-[#07966f]"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>

            <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
              <p className="font-semibold text-red-600">
                {error || "Nota tidak ditemukan."}
              </p>

              <button
                type="button"
                onClick={fetchNota}
                className="mt-5 rounded-xl bg-[#07966f] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <NasabahSidebar />

      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="mx-auto max-w-4xl px-5 py-8 lg:px-8">
          {/* BUTTON ATAS */}

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium text-[#07966f] hover:underline"
            >
              <ArrowLeft size={18} />
              Kembali ke Riwayat
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#07966f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#067f5e]"
            >
              <Printer size={18} />
              Cetak Nota
            </button>
          </div>

          {/* NOTA */}

          <div
            id="nota-penukaran"
            className="overflow-hidden rounded-2xl border border-[#e3e8ef] bg-white shadow-sm"
          >
            {/* HEADER */}

            <div className="border-b border-[#e3e8ef] px-6 py-7 text-center sm:px-10">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9fbf4]">
                <Recycle size={28} className="text-[#07966f]" />
              </div>

              <h1 className="text-xl font-bold text-[#172b4d]">
                Bank Sampah Bersih Mandiri
              </h1>

              <p className="mt-1 text-sm text-[#718198]">
                Nota Bukti Transaksi Penukaran Poin
              </p>

              <div className="mt-5 flex justify-center">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusStyle(
                    nota.status,
                  )}`}
                >
                  {nota.status === "selesai" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Clock3 size={16} />
                  )}

                  {getStatusLabel(nota.status)}
                </span>
              </div>
            </div>

            {/* KODE + TANGGAL */}

            <div className="grid grid-cols-1 border-b border-[#e3e8ef] sm:grid-cols-2">
              <div className="border-b border-[#e3e8ef] px-6 py-5 sm:border-b-0 sm:border-r sm:px-10">
                <p className="text-xs uppercase tracking-wide text-[#9aa7b8]">
                  Kode Penukaran
                </p>

                <p className="mt-1 text-base font-bold text-[#172b4d]">
                  {nota.kodePenukaran}
                </p>
              </div>

              <div className="px-6 py-5 sm:px-10">
                <p className="text-xs uppercase tracking-wide text-[#9aa7b8]">
                  Tanggal Transaksi
                </p>

                <p className="mt-1 text-base font-semibold text-[#172b4d]">
                  {formatTanggal(nota.tanggal)}
                </p>

                <p className="text-xs text-[#718198]">
                  Pukul {formatJam(nota.tanggal)} WIB
                </p>
              </div>
            </div>

            {/* DATA NASABAH */}

            <div className="border-b border-[#e3e8ef] px-6 py-6 sm:px-10">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e9fbf4]">
                  <User size={18} className="text-[#07966f]" />
                </div>

                <h2 className="font-bold text-[#172b4d]">Data Nasabah</h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#9aa7b8]">Nama Nasabah</p>

                  <p className="mt-1 text-sm font-semibold text-[#172b4d]">
                    {nota.nasabah.namaNasabah}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="text-[#9aa7b8]" />

                    <p className="text-xs text-[#9aa7b8]">No. Telepon</p>
                  </div>

                  <p className="mt-1 text-sm font-semibold text-[#172b4d]">
                    {nota.nasabah.telp}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#9aa7b8]" />

                    <p className="text-xs text-[#9aa7b8]">Alamat</p>
                  </div>

                  <p className="mt-1 text-sm font-semibold text-[#172b4d]">
                    {nota.nasabah.alamat}
                  </p>
                </div>
              </div>
            </div>

            {/* DETAIL HADIAH */}

            <div className="border-b border-[#e3e8ef] px-6 py-6 sm:px-10">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e9fbf4]">
                  <Gift size={18} className="text-[#07966f]" />
                </div>

                <h2 className="font-bold text-[#172b4d]">Detail Penukaran</h2>
              </div>

              <div className="flex flex-col gap-5 rounded-xl border border-[#e3e8ef] p-4 sm:flex-row sm:items-center">
                {nota.hadiah.foto ? (
                  <img
                    src={getFotoUrl(nota.hadiah.foto)}
                    alt={nota.hadiah.namaHadiah}
                    className="h-24 w-24 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[#e9fbf4]">
                    <Gift size={32} className="text-[#07966f]" />
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-base font-bold text-[#172b4d]">
                    {nota.hadiah.namaHadiah}
                  </p>

                  <p className="mt-1 text-sm text-[#718198]">
                    Hadiah yang ditukarkan menggunakan poin nasabah.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-[#e9fbf4] px-3 py-1.5 text-xs font-semibold text-[#008563]">
                      {nota.poinTerpakai} Poin Digunakan
                    </span>

                    <span className="rounded-lg bg-[#f5f7f9] px-3 py-1.5 text-xs font-medium text-[#718198]">
                      Nilai Hadiah: {nota.hadiah.poinDibutuhkan} Poin
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TOTAL */}

            <div className="bg-[#f7f9fb] px-6 py-6 sm:px-10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#718198]">
                  Total Poin Digunakan
                </span>

                <span className="text-2xl font-bold text-[#07966f]">
                  {nota.poinTerpakai} Pts
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#e3e8ef] pt-4">
                <span className="text-sm font-medium text-[#718198]">
                  Sisa Saldo Poin
                </span>

                <span className="text-base font-bold text-[#172b4d]">
                  {nota.nasabah.saldoPoin} Pts
                </span>
              </div>
            </div>

            {/* FOOTER */}

            <div className="border-t border-[#e3e8ef] px-6 py-7 text-center sm:px-10">
              <p className="text-xs leading-relaxed text-[#9aa7b8]">
                Nota ini merupakan bukti transaksi penukaran poin pada Bank
                Sampah Bersih Mandiri.
              </p>

              <p className="mt-1 text-xs text-[#9aa7b8]">
                Kode transaksi: {nota.kodePenukaran}
              </p>

              <p className="mt-3 text-[11px] text-[#b0bac7]">
                Harap tunjukkan nota ini kepada petugas Bank Sampah apabila
                diperlukan.
              </p>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          html,
          body {
            background: white !important;
          }

          header,
          aside {
            display: none !important;
          }

          main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          #nota-penukaran {
            border: 1px solid #e3e8ef !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          * {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
