"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Coins,
  Gift,
  Package,
  CheckCircle2,
} from "lucide-react";
import NasabahSidebar from "../../../../components/NasabahSidebar";

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
  data: Hadiah;
};

type TukarResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: {
    id: string;
    appMakerId: string;
    kodePenukaran: string;
    tanggal: string;
    nasabahId: string;
    hadiahId: string;
    poinTerpakai: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    hadiah?: {
      id: string;
      namaHadiah: string;
      poinDibutuhkan: number;
      stok: number;
      foto?: string;
    };
    nasabah?: {
      id: string;
      appMakerId: string;
      userId: string;
      namaNasabah: string;
      alamat: string;
      telp: string;
      saldoPoin: number;
      foto?: string;
    };
    sisaSaldoPoinNasabah?: number;
  };
};

const getFotoUrl = (foto?: string) => {
  if (!foto) return "";

  if (foto.startsWith("http")) {
    return foto;
  }

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

export default function DetailHadiahPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [hadiah, setHadiah] = useState<Hadiah | null>(null);
  const [saldoPoin, setSaldoPoin] = useState(0);

  const [loading, setLoading] = useState(true);
  const [tukarLoading, setTukarLoading] = useState(false);

  const [error, setError] = useState("");
  const [tukarError, setTukarError] = useState("");

  const [tukarSuccess, setTukarSuccess] = useState<TukarResponse | null>(null);

  useEffect(() => {
    const fetchDetailHadiah = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Silakan login terlebih dahulu.");
          return;
        }

        if (!id) {
          setError("ID hadiah tidak ditemukan.");
          return;
        }

        if (!BASE_URL || !APP_KEY) {
          setError("Konfigurasi API belum ditemukan.");
          return;
        }

        /* =========================
           DETAIL HADIAH
        ========================= */

        const response = await fetch(
          `${BASE_URL}/hadiah/${id}?_=${Date.now()}`,
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

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil detail hadiah.");
        }

        setHadiah(result.data);

        /* =========================
           PROFILE / SALDO POIN
        ========================= */

        const profileResponse = await fetch(
          `${BASE_URL}/auth/me?_=${Date.now()}`,
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

        const profileResult = await profileResponse.json();

        if (profileResponse.ok) {
          const profile = profileResult?.data || profileResult;

          const saldo = profile?.nasabah?.saldoPoin ?? profile?.saldoPoin ?? 0;

          setSaldoPoin(Number(saldo));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailHadiah();
  }, [id]);

  /* =========================
     TUKAR POIN
  ========================= */

  const handleTukarPoin = async () => {
    if (!hadiah) return;

    setTukarError("");
    setTukarSuccess(null);

    /* Cek stok */
    if (hadiah.stok <= 0) {
      setTukarError("Stok hadiah sedang habis.");
      return;
    }

    /* Cek saldo */
    if (saldoPoin < hadiah.poinDibutuhkan) {
      setTukarError(
        `Poin kamu tidak cukup. Kamu memiliki ${saldoPoin} Pts, sedangkan hadiah ini membutuhkan ${hadiah.poinDibutuhkan} Pts.`,
      );
      return;
    }

    try {
      setTukarLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      if (!BASE_URL || !APP_KEY) {
        setTukarError("Konfigurasi API belum ditemukan.");
        return;
      }

      /* =========================
         POST TUKAR POIN
      ========================= */

      const response = await fetch(`${BASE_URL}/penukaran-poin/tukar`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hadiahId: id,
        }),
      });

      const result: TukarResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal melakukan penukaran poin.");
      }

      setTukarSuccess(result);

      /* Update saldo dari response BE */
      if (result.data?.sisaSaldoPoinNasabah !== undefined) {
        setSaldoPoin(result.data.sisaSaldoPoinNasabah);
      }

      /* Update stok dari response BE */
      if (result.data?.hadiah) {
        setHadiah((prev) =>
          prev
            ? {
                ...prev,
                stok: result.data!.hadiah!.stok,
              }
            : prev,
        );
      }

      /* =========================
         REDIRECT KE RIWAYAT TUKAR
      ========================= */

      setTimeout(() => {
        router.push("/nasabah/riwayattukarhadiah");
      }, 1000);
    } catch (err) {
      setTukarError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menukar poin.",
      );
    } finally {
      setTukarLoading(false);
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <NasabahSidebar />

        <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-gray-500">Memuat detail hadiah...</p>
          </div>
        </main>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error || !hadiah) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <NasabahSidebar />

        <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
          <div className="p-5 md:p-8">
            <Link
              href="/nasabah/hadiah"
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#07966f]"
            >
              <ArrowLeft size={18} />
              Kembali ke Hadiah
            </Link>

            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error || "Data hadiah tidak ditemukan."}
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =========================
     BERHASIL TUKAR
  ========================= */

  if (tukarSuccess?.success) {
    const data = tukarSuccess.data;

    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <NasabahSidebar />

        <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
          <div className="p-5 md:p-8">
            <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle2 size={36} className="text-[#07966f]" />
                </div>

                <h1 className="mt-4 text-2xl font-bold text-gray-900">
                  Penukaran Berhasil!
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {tukarSuccess.message}
                </p>

                <div className="mt-6 w-full rounded-xl bg-gray-50 p-5 text-left">
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-xs text-gray-500">Kode Penukaran</p>

                    <p className="mt-1 text-lg font-bold text-[#07966f]">
                      {data?.kodePenukaran || "-"}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-gray-500">Hadiah</span>

                      <span className="text-sm font-semibold text-gray-800">
                        {data?.hadiah?.namaHadiah || hadiah.namaHadiah}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-gray-500">
                        Poin Terpakai
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {data?.poinTerpakai ?? 0} Pts
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-gray-500">Status</span>

                      <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold capitalize text-yellow-700">
                        {data?.status || "diproses"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-gray-500">Sisa Saldo</span>

                      <span className="text-sm font-semibold text-[#07966f]">
                        {data?.sisaSaldoPoinNasabah ?? saldoPoin} Pts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 w-full">
                  <p className="text-xs text-gray-400">
                    Mengarahkan ke riwayat penukaran hadiah...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const fotoUrl = getFotoUrl(hadiah.foto);

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <NasabahSidebar />

      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="p-5 md:p-8">
          <div className="mb-7 flex items-center gap-3">
            <Link
              href="/nasabah/hadiah"
              className="rounded-lg p-2 transition hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detail Hadiah
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Informasi lengkap barang atau voucher hadiah.
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="grid md:grid-cols-2">
              {/* FOTO */}

              <div className="flex min-h-[350px] items-center justify-center bg-gray-100">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt={hadiah.namaHadiah}
                    className="h-full max-h-[450px] w-full object-cover"
                  />
                ) : (
                  <Gift size={80} className="text-gray-300" />
                )}
              </div>

              {/* DETAIL */}

              <div className="p-6 md:p-8">
                <p className="mb-2 text-sm font-medium text-[#07966f]">
                  Katalog Hadiah
                </p>

                <h2 className="text-2xl font-bold text-gray-900">
                  {hadiah.namaHadiah}
                </h2>

                <div className="mt-6 space-y-4">
                  {/* POIN HADIAH */}

                  <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4">
                    <div className="rounded-lg bg-white p-2">
                      <Coins size={22} className="text-[#07966f]" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Poin Dibutuhkan</p>

                      <p className="font-bold text-[#07966f]">
                        {hadiah.poinDibutuhkan} Pts
                      </p>
                    </div>
                  </div>

                  {/* STOK */}

                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="rounded-lg bg-white p-2">
                      <Package size={22} className="text-gray-600" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Stok Tersedia</p>

                      <p className="font-bold text-gray-800">
                        {hadiah.stok} barang
                      </p>
                    </div>
                  </div>

                  {/* TANGGAL */}

                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="rounded-lg bg-white p-2">
                      <CalendarDays size={22} className="text-gray-600" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Ditambahkan</p>

                      <p className="font-medium text-gray-800">
                        {formatTanggal(hadiah.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* SALDO POIN */}

                  <div className="flex items-center justify-between rounded-xl border border-green-100 bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-white p-2">
                        <Coins size={22} className="text-[#07966f]" />
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Saldo Poin Kamu</p>

                        <p className="font-bold text-[#07966f]">
                          {saldoPoin} Pts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ERROR TUKAR */}

                {tukarError && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {tukarError}
                  </div>
                )}

                {/* BUTTON TUKAR */}

                <button
                  type="button"
                  onClick={handleTukarPoin}
                  disabled={
                    tukarLoading ||
                    hadiah.stok <= 0 ||
                    saldoPoin < hadiah.poinDibutuhkan
                  }
                  className="mt-7 w-full rounded-xl bg-[#07966f] py-3 font-semibold text-white transition hover:bg-[#067d5d] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {tukarLoading
                    ? "Memproses..."
                    : hadiah.stok <= 0
                      ? "Stok Habis"
                      : saldoPoin < hadiah.poinDibutuhkan
                        ? "Poin Tidak Cukup"
                        : "Tukar Hadiah"}
                </button>

                <p className="mt-3 text-center text-xs text-gray-400">
                  Pastikan poin kamu cukup sebelum melakukan penukaran.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
