"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  Printer,
  User,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

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

type Nasabah = {
  id?: string;
  namaNasabah?: string;
  alamat?: string;
  telp?: string;
  saldoPoin?: number;
  foto?: string;
  user?: {
    username?: string;
    role?: string;
  };
};

type Setoran = {
  id: string;
  appMakerId?: string;
  kodeSetor: string;
  tanggal: string;
  nasabahId: string;
  status: Status;
  totalBeratKg: number;
  totalPoin: number;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
  detailSetors: DetailSetor[];
  nasabah?: Nasabah;
  user?: {
    username?: string;
  };
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
  menunggu_konfirmasi: "border border-yellow-200 bg-yellow-50 text-yellow-700",
  diverifikasi: "border border-blue-200 bg-blue-50 text-blue-700",
  selesai: "border border-green-200 bg-green-50 text-green-700",
  ditolak: "border border-red-200 bg-red-50 text-red-700",
};

export default function AdminSetoranDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [setoran, setSetoran] = useState<Setoran | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= VERIFIKASI =================
  const [beratReal, setBeratReal] = useState<Record<string, string>>({});
  const [catatanAdmin, setCatatanAdmin] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Status>("diverifikasi");

  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [verifyError, setVerifyError] = useState("");

  // ================= GET DETAIL =================
  const getData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      if (!BASE_URL) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL belum ditemukan.");
      }

      if (!APP_KEY) {
        throw new Error("NEXT_PUBLIC_APP_KEY belum ditemukan.");
      }

      const response = await fetch(
        `${BASE_URL}/setor-sampah/${id}?_=${Date.now()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "x-app-key": APP_KEY,
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        },
      );

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil detail setoran.");
      }

      setSetoran(result.data);

      // Isi berat real awal dari berat pengajuan
      const initialBerat: Record<string, string> = {};

      result.data.detailSetors?.forEach((detail) => {
        initialBerat[detail.kategoriSampahId] = String(detail.beratKg);
      });

      setBeratReal(initialBerat);

      /*
       * Kalau status masih belum selesai/ditolak,
       * dropdown tetap bisa digunakan.
       */
      if (
        result.data.status === "selesai" ||
        result.data.status === "ditolak"
      ) {
        setSelectedStatus(result.data.status);
      } else if (result.data.status === "diverifikasi") {
        setSelectedStatus("diverifikasi");
      } else {
        setSelectedStatus("diverifikasi");
      }
    } catch (err) {
      console.error("GET DETAIL SETORAN ERROR:", err);

      setError(
        err instanceof Error ? err.message : "Gagal mengambil detail setoran.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      getData();
    }
  }, [id, getData]);

  // ================= FORMAT =================

  const formatTanggal = (tanggal?: string) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatJam = (tanggal?: string) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBerat = (berat?: number) => {
    if (berat === undefined || berat === null) {
      return "0";
    }

    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 2,
    }).format(berat);
  };

  const formatPoin = (poin?: number) => {
    return new Intl.NumberFormat("id-ID").format(poin || 0);
  };

  const formatRupiah = (nominal?: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(nominal || 0);
  };

  const getNamaNasabah = () => {
    if (!setoran) return "-";

    return setoran.nasabah?.namaNasabah || setoran.user?.username || "-";
  };

  // ================= CETAK NOTA =================

  const handlePrint = () => {
    /*
     * Nota hanya boleh dicetak jika status benar-benar selesai.
     */
    if (!setoran || setoran.status !== "selesai") {
      return;
    }

    window.print();
  };

  // ================= BERAT REAL =================

  const handleBeratChange = (kategoriSampahId: string, value: string) => {
    setBeratReal((prev) => ({
      ...prev,
      [kategoriSampahId]: value,
    }));
  };

  // ================= VERIFIKASI =================

  const handleVerify = async () => {
    if (!setoran) return;

    try {
      setVerifying(true);
      setVerifyMessage("");
      setVerifyError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      if (!BASE_URL) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL belum ditemukan.");
      }

      if (!APP_KEY) {
        throw new Error("NEXT_PUBLIC_APP_KEY belum ditemukan.");
      }

      /*
       * Berat real tetap dikirim ke backend
       * setiap kali admin mengubah status.
       */
      const itemsReal = setoran.detailSetors.map((detail) => ({
        kategoriSampahId: detail.kategoriSampahId,
        beratKgReal: Number(beratReal[detail.kategoriSampahId] || 0),
      }));

      const adaBeratTidakValid = itemsReal.some(
        (item) => Number.isNaN(item.beratKgReal) || item.beratKgReal <= 0,
      );

      if (adaBeratTidakValid) {
        setVerifyError("Berat real harus diisi dan lebih dari 0 kg.");
        return;
      }

      const catatanDefault =
        selectedStatus === "ditolak"
          ? "Setoran ditolak oleh admin."
          : selectedStatus === "diverifikasi"
            ? "Setoran telah diverifikasi oleh admin."
            : "Berat sampah sesuai timbangan real.";

      const response = await fetch(
        `${BASE_URL}/setor-sampah/admin/verify/${setoran.id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "x-app-key": APP_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: selectedStatus,
            catatanAdmin: catatanAdmin.trim() || catatanDefault,
            itemsReal,
          }),
        },
      );

      const result = await response.json();

      console.log("HASIL VERIFIKASI:", result);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal melakukan perubahan status setoran.",
        );
      }

      setVerifyMessage(
        result.message ||
          `Status setoran berhasil diubah menjadi ${statusLabel[selectedStatus]}.`,
      );

      /*
       * Ambil ulang data dari backend supaya status
       * yang ditampilkan benar-benar sesuai data terbaru.
       */
      await getData();

      /*
       * Kalau sudah selesai/ditolak, reset pesan setelah
       * data berhasil diperbarui.
       */
      setCatatanAdmin("");
    } catch (err) {
      console.error("VERIFIKASI ERROR:", err);

      setVerifyError(
        err instanceof Error
          ? err.message
          : "Gagal melakukan perubahan status setoran.",
      );
    } finally {
      setVerifying(false);
    }
  };

  /*
   * Dropdown dan input verifikasi hanya tampil
   * jika status belum selesai dan belum ditolak.
   */
  const canVerify =
    setoran?.status !== "selesai" && setoran?.status !== "ditolak";

  return (
    <>
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
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#f7f9fb]">
        <AdminSidebar />

        <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
          <div className="print-container px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* HEADER */}
            <div className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#172b4d]">
                  Detail Setoran
                </h1>

                <p className="mt-1 text-sm text-[#718198]">
                  Informasi lengkap pengajuan setoran sampah
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/admin/setoran"
                  className="flex w-fit items-center gap-2 rounded-xl border border-[#e3e8ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#304563] transition hover:bg-gray-50 hover:text-[#07966f]"
                >
                  <ArrowLeft size={18} />
                  Kembali
                </Link>

                {/* CETAK NOTA HANYA SAAT SELESAI */}
                {setoran?.status === "selesai" && (
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex w-fit items-center gap-2 rounded-xl bg-[#07966f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#067f5e]"
                  >
                    <Printer size={18} />
                    Cetak Nota
                  </button>
                )}
              </div>
            </div>

            {/* HEADER PRINT */}
            {!loading && !error && setoran && setoran.status === "selesai" && (
              <div className="mb-6 hidden text-center print:block">
                <h1 className="text-2xl font-bold text-[#172b4d]">
                  BANK SAMPAH BERSIH MANDIRI
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                  Nota Penyetoran Sampah
                </p>

                <div className="mx-auto mt-4 h-px w-full bg-gray-300" />
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-[#e3e8ef] bg-white">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={32} className="animate-spin text-[#07966f]" />

                  <p className="text-sm text-[#718198]">
                    Memuat detail setoran...
                  </p>
                </div>
              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <XCircle size={22} className="mt-0.5 shrink-0 text-red-500" />

                  <div>
                    <p className="font-semibold text-red-600">
                      Terjadi kesalahan
                    </p>

                    <p className="mt-1 text-sm text-red-500">{error}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={getData}
                  className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* CONTENT */}
            {!loading && !error && setoran && (
              <div className="space-y-6">
                {/* KODE + STATUS */}
                <div className="print-card rounded-2xl border border-[#e3e8ef] bg-white p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#718198]">
                        Kode Setoran
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-[#172b4d]">
                        {setoran.kodeSetor || "-"}
                      </h2>
                    </div>

                    <span
                      className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                        statusClass[setoran.status] ||
                        "border border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    >
                      {statusLabel[setoran.status] || setoran.status}
                    </span>
                  </div>
                </div>

                {/* INFORMASI */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* DATA NASABAH */}
                  <div className="print-card rounded-2xl border border-[#e3e8ef] bg-white p-5 sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9fbf4]">
                        <User size={20} className="text-[#07966f]" />
                      </div>

                      <h2 className="text-lg font-bold text-[#172b4d]">
                        Data Nasabah
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-[#718198]">Nama Nasabah</p>

                        <p className="mt-1 break-words font-semibold text-[#304563]">
                          {getNamaNasabah()}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-[#718198]">Username</p>

                        <p className="mt-1 break-words font-semibold text-[#304563]">
                          {setoran.nasabah?.user?.username ||
                            setoran.user?.username ||
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-[#718198]">No. Telepon</p>

                        <p className="mt-1 break-words font-semibold text-[#304563]">
                          {setoran.nasabah?.telp || "-"}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-[#718198]" />

                          <p className="text-sm text-[#718198]">Alamat</p>
                        </div>

                        <p className="mt-1 break-words font-semibold leading-relaxed text-[#304563]">
                          {setoran.nasabah?.alamat || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* INFORMASI SETORAN */}
                  <div className="print-card rounded-2xl border border-[#e3e8ef] bg-white p-5 sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9fbf4]">
                        <CalendarDays size={20} className="text-[#07966f]" />
                      </div>

                      <h2 className="text-lg font-bold text-[#172b4d]">
                        Informasi Setoran
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-[#718198]">Tanggal</p>

                        <p className="mt-1 font-semibold text-[#304563]">
                          {formatTanggal(setoran.tanggal)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-[#718198]">Waktu</p>

                        <p className="mt-1 font-semibold text-[#304563]">
                          {formatJam(setoran.tanggal)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-[#718198]">Total Berat</p>

                        <p className="mt-1 text-lg font-bold text-[#07966f]">
                          {formatBerat(setoran.totalBeratKg)} kg
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-[#718198]">Total Poin</p>

                        <p className="mt-1 text-lg font-bold text-[#07966f]">
                          {formatPoin(setoran.totalPoin)} Pts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DETAIL SAMPAH */}
                <div className="print-card rounded-2xl border border-[#e3e8ef] bg-white p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9fbf4]">
                      <Package size={20} className="text-[#07966f]" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#172b4d]">
                        Detail Sampah
                      </h2>

                      <p className="text-sm text-[#718198]">
                        Rincian sampah yang disetorkan
                      </p>
                    </div>
                  </div>

                  {/* MOBILE */}
                  <div className="space-y-3 lg:hidden">
                    {setoran.detailSetors?.length > 0 ? (
                      setoran.detailSetors.map((detail, index) => (
                        <div
                          key={detail.id}
                          className="rounded-xl border border-[#e3e8ef] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs text-[#718198]">
                                Sampah {index + 1}
                              </p>

                              <p className="mt-1 break-words font-semibold text-[#172b4d]">
                                {detail.kategoriSampah?.namaKategori || "-"}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-lg bg-[#e9fbf4] px-2.5 py-1 text-xs font-semibold capitalize text-[#008563]">
                              {detail.kategoriSampah?.jenis || "-"}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-[#718198]">
                                Berat Pengajuan
                              </p>

                              <p className="mt-1 text-sm font-semibold text-[#304563]">
                                {formatBerat(detail.beratKg)} kg
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#718198]">Poin</p>

                              <p className="mt-1 text-sm font-semibold text-[#07966f]">
                                {formatPoin(detail.subtotalPoin)} Pts
                              </p>
                            </div>
                          </div>

                          {/* BERAT REAL */}
                          {canVerify && (
                            <div className="no-print mt-4 border-t border-[#e3e8ef] pt-4">
                              <label className="text-xs font-semibold text-[#304563]">
                                Berat Real (kg)
                              </label>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={beratReal[detail.kategoriSampahId] || ""}
                                onChange={(e) =>
                                  handleBeratChange(
                                    detail.kategoriSampahId,
                                    e.target.value,
                                  )
                                }
                                className="mt-2 w-full rounded-xl border border-[#dce3ea] px-3 py-2.5 text-sm outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-[#07966f]/10"
                                placeholder="Masukkan berat real"
                              />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl bg-[#f7f9fb] p-5 text-center text-sm text-[#718198]">
                        Tidak ada detail sampah.
                      </div>
                    )}
                  </div>

                  {/* DESKTOP */}
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="border-b border-[#e3e8ef] text-left">
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                            No
                          </th>

                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                            Kategori Sampah
                          </th>

                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                            Jenis
                          </th>

                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                            Harga/Kg
                          </th>

                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                            Berat Pengajuan
                          </th>

                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                            Berat Real
                          </th>

                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#718198]">
                            Poin
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {setoran.detailSetors?.length > 0 ? (
                          setoran.detailSetors.map((detail, index) => (
                            <tr
                              key={detail.id}
                              className="border-b border-[#eef1f4] last:border-0"
                            >
                              <td className="px-4 py-4 text-sm text-[#718198]">
                                {index + 1}
                              </td>

                              <td className="px-4 py-4 text-sm font-semibold text-[#304563]">
                                {detail.kategoriSampah?.namaKategori || "-"}
                              </td>

                              <td className="px-4 py-4">
                                <span className="rounded-lg bg-[#e9fbf4] px-2.5 py-1 text-xs font-semibold capitalize text-[#008563]">
                                  {detail.kategoriSampah?.jenis || "-"}
                                </span>
                              </td>

                              <td className="px-4 py-4 text-sm text-[#304563]">
                                {formatRupiah(
                                  detail.kategoriSampah?.hargaPerKg,
                                )}
                              </td>

                              <td className="px-4 py-4 text-sm text-[#304563]">
                                {formatBerat(detail.beratKg)} kg
                              </td>

                              <td className="px-4 py-4">
                                {canVerify ? (
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                      beratReal[detail.kategoriSampahId] || ""
                                    }
                                    onChange={(e) =>
                                      handleBeratChange(
                                        detail.kategoriSampahId,
                                        e.target.value,
                                      )
                                    }
                                    className="no-print w-[130px] rounded-lg border border-[#dce3ea] px-3 py-2 text-sm outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-[#07966f]/10"
                                    placeholder="0"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold text-[#304563]">
                                    {formatBerat(detail.beratKg)} kg
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-4 text-right text-sm font-semibold text-[#07966f]">
                                {formatPoin(detail.subtotalPoin)} Pts
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-10 text-center text-sm text-[#718198]"
                            >
                              Tidak ada detail sampah.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* VERIFIKASI */}
                {canVerify && (
                  <div className="no-print rounded-2xl border border-[#b7e8d9] bg-white p-5 sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9fbf4]">
                        <ShieldCheck size={21} className="text-[#07966f]" />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-[#172b4d]">
                          Verifikasi Setoran
                        </h2>

                        <p className="text-sm text-[#718198]">
                          Periksa berat sampah kemudian tentukan status setoran.
                        </p>
                      </div>
                    </div>

                    {/* STATUS DROPDOWN */}
                    <div className="mb-5">
                      <label className="text-sm font-semibold text-[#304563]">
                        Status Setoran
                      </label>

                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(e.target.value as Status)
                        }
                        className="mt-2 w-full rounded-xl border border-[#dce3ea] bg-white px-4 py-3 text-sm text-[#304563] outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-[#07966f]/10"
                      >
                        <option value="diverifikasi">Diverifikasi</option>

                        <option value="selesai">Selesai</option>

                        <option value="ditolak">Ditolak</option>
                      </select>

                      <p className="mt-2 text-xs text-[#718198]">
                        Pilih status sesuai hasil pemeriksaan setoran.
                      </p>
                    </div>

                    {/* CATATAN */}
                    <div>
                      <label className="text-sm font-semibold text-[#304563]">
                        Catatan Admin
                      </label>

                      <textarea
                        value={catatanAdmin}
                        onChange={(e) => setCatatanAdmin(e.target.value)}
                        rows={3}
                        placeholder={
                          selectedStatus === "ditolak"
                            ? "Tuliskan alasan setoran ditolak..."
                            : selectedStatus === "selesai"
                              ? "Contoh: Berat sampah sesuai timbangan real."
                              : "Contoh: Setoran sudah diverifikasi dan sedang menunggu penyelesaian."
                        }
                        className="mt-2 w-full resize-none rounded-xl border border-[#dce3ea] px-4 py-3 text-sm text-[#304563] outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-[#07966f]/10"
                      />
                    </div>

                    {/* INFO STATUS */}
                    <div className="mt-4 rounded-xl bg-[#f7f9fb] p-4">
                      <p className="text-xs font-semibold text-[#718198]">
                        Status saat ini
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#304563]">
                        {statusLabel[setoran.status] || setoran.status}
                      </p>

                      {setoran.status === "diverifikasi" && (
                        <p className="mt-1 text-xs text-[#718198]">
                          Setoran sudah diverifikasi. Admin masih dapat
                          mengubahnya menjadi selesai atau ditolak.
                        </p>
                      )}

                      {setoran.status === "menunggu_konfirmasi" && (
                        <p className="mt-1 text-xs text-[#718198]">
                          Silakan periksa berat real lalu tentukan status
                          setoran.
                        </p>
                      )}
                    </div>

                    {/* ERROR */}
                    {verifyError && (
                      <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
                        <XCircle
                          size={19}
                          className="mt-0.5 shrink-0 text-red-500"
                        />

                        <p className="text-sm text-red-600">{verifyError}</p>
                      </div>
                    )}

                    {/* SUCCESS */}
                    {verifyMessage && (
                      <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4">
                        <CheckCircle2
                          size={19}
                          className="mt-0.5 shrink-0 text-green-600"
                        />

                        <p className="text-sm text-green-700">
                          {verifyMessage}
                        </p>
                      </div>
                    )}

                    {/* BUTTON */}
                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        onClick={handleVerify}
                        disabled={verifying}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#07966f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#067f5e] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {verifying ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} />
                            Simpan Status
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* CATATAN NASABAH */}
                <div className="print-card rounded-2xl border border-[#e3e8ef] bg-white p-5 sm:p-6">
                  <h2 className="mb-3 text-lg font-bold text-[#172b4d]">
                    Catatan Nasabah
                  </h2>

                  <div className="rounded-xl bg-[#f7f9fb] p-4">
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#304563]">
                      {setoran.catatan || "Tidak ada catatan."}
                    </p>
                  </div>
                </div>

                {/* RINGKASAN */}
                <div className="print-card rounded-2xl bg-[#075c47] p-5 text-white sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-green-100">Total Berat</p>

                      <p className="mt-1 text-2xl font-bold">
                        {formatBerat(setoran.totalBeratKg)} kg
                      </p>
                    </div>

                    <div className="hidden h-12 w-px bg-white/20 sm:block" />

                    <div>
                      <p className="text-sm text-green-100">Total Poin</p>

                      <p className="mt-1 text-2xl font-bold">
                        {formatPoin(setoran.totalPoin)} Pts
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3">
                      {setoran.status === "selesai" ? (
                        <CheckCircle2 size={21} />
                      ) : (
                        <Package size={21} />
                      )}

                      <span className="text-sm font-semibold">
                        {statusLabel[setoran.status] || setoran.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FOOTER PRINT */}
                {setoran.status === "selesai" && (
                  <div className="hidden pt-6 text-center print:block">
                    <div className="h-px w-full bg-gray-300" />

                    <p className="mt-4 text-xs text-gray-500">
                      Nota ini dicetak dari sistem Bank Sampah Bersih Mandiri.
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Kode Setoran: {setoran.kodeSetor}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
