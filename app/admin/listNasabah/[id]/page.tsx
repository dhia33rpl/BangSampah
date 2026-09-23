"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Coins,
  CalendarDays,
  Loader2,
  Recycle,
  ArrowUpFromLine,
  Pencil,
} from "lucide-react";
import AdminSidebar from "../../../../components/AdminSidebar";

type NasabahDetail = {
  id: string;
  appMakerId: string;
  userId: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  saldoPoin: number;
  foto?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    username: string;
    role: string;
  };
  setorSampahs?: any[];
  penukaranPoins?: any[];
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY;

export default function DetailNasabahPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [nasabah, setNasabah] = useState<NasabahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // URL FOTO
  // =====================================================

  const getFotoUrl = (foto?: string) => {
    if (!foto) return "";

    if (foto.startsWith("http")) {
      return foto;
    }

    const serverUrl = BASE_URL?.replace(/\/api\/v1\/?$/, "");
    const path = foto.startsWith("/") ? foto : `/${foto}`;

    return `${serverUrl}${path}`;
  };

  // =====================================================
  // AMBIL DATA NASABAH
  // =====================================================

  const fetchNasabah = async () => {
    try {
      setLoading(true);
      setError("");

      if (!BASE_URL) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL belum ditemukan.");
      }

      if (!APP_KEY) {
        throw new Error("NEXT_PUBLIC_APP_KEY belum ditemukan.");
      }

      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const url = `${BASE_URL}/admin/nasabah/${id}?_=${Date.now()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        cache: "no-store",
      });

      const result = await response.json();

      console.log("RESPONSE DETAIL NASABAH:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil detail nasabah.");
      }

      setNasabah(result.data);
    } catch (err) {
      console.error("DETAIL NASABAH ERROR:", err);

      setError(
        err instanceof Error ? err.message : "Gagal mengambil data nasabah.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    if (id) {
      fetchNasabah();
    }
  }, [id]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <AdminSidebar />

        <main className="ml-0 flex min-h-screen items-center justify-center pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
          <div className="flex items-center gap-2 text-sm text-[#718198]">
            <Loader2 size={20} className="animate-spin" />
            Memuat data nasabah...
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <AdminSidebar />

        <main className="ml-0 flex min-h-screen items-center justify-center px-5 pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
          <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
            <p className="mb-4 text-sm text-red-500">{error}</p>

            <button
              onClick={fetchNasabah}
              className="rounded-xl bg-[#07966f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#067f5e]"
            >
              Coba Lagi
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // DATA TIDAK ADA
  // =====================================================

  if (!nasabah) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <AdminSidebar />

        <main className="ml-0 flex min-h-screen items-center justify-center pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
          <p className="text-sm text-[#718198]">
            Data nasabah tidak ditemukan.
          </p>
        </main>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {/* SIDEBAR */}

      <AdminSidebar />

      {/* CONTENT */}

      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                onClick={() => router.push("/admin/listNasabah")}
                className="mb-4 flex items-center gap-2 text-sm font-medium text-[#718198] transition hover:text-[#07966f]"
              >
                <ArrowLeft size={18} />
                Kembali ke Nasabah
              </button>

              <h1 className="text-2xl font-bold text-[#172b4d]">
                Detail Nasabah
              </h1>

              <p className="mt-1 text-sm text-[#718198]">
                Informasi lengkap nasabah
              </p>
            </div>

            <button
              onClick={() => router.push(`/admin/listNasabah/${id}/edit`)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#07966f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#067f5e]"
            >
              <Pencil size={17} />
              Edit Nasabah
            </button>
          </div>

          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="mb-6 overflow-hidden rounded-2xl border border-[#e3e8ef] bg-white shadow-sm">
            <div className="p-5 sm:p-6 md:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {/* FOTO */}

                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#e9fbf4]">
                  {nasabah.foto ? (
                    <img
                      key={nasabah.foto}
                      src={`${getFotoUrl(
                        nasabah.foto,
                      )}?v=${encodeURIComponent(nasabah.updatedAt)}`}
                      alt={nasabah.namaNasabah}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={42} className="text-[#07966f]" />
                  )}
                </div>

                {/* NAMA */}

                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-bold text-[#172b4d]">
                    {nasabah.namaNasabah}
                  </h2>

                  <p className="mt-1 break-all text-sm text-[#718198]">
                    @{nasabah.user?.username || "-"}
                  </p>

                  <div className="mt-3 inline-flex items-center rounded-full bg-[#e9fbf4] px-3 py-1 text-xs font-semibold text-[#008563]">
                    {nasabah.user?.role || "NASABAH"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              STATISTIK
          ================================================= */}

          <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* SALDO */}

            <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50">
                <Coins size={20} className="text-yellow-600" />
              </div>

              <p className="text-sm text-[#718198]">Saldo Poin</p>

              <p className="mt-1 text-2xl font-bold text-[#172b4d]">
                {nasabah.saldoPoin.toLocaleString("id-ID")}
              </p>
            </div>

            {/* SETORAN */}

            <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9fbf4]">
                <Recycle size={20} className="text-[#07966f]" />
              </div>

              <p className="text-sm text-[#718198]">Total Setoran</p>

              <p className="mt-1 text-2xl font-bold text-[#172b4d]">
                {nasabah.setorSampahs?.length || 0}
              </p>
            </div>

            {/* PENUKARAN */}

            <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm sm:col-span-2 md:col-span-1">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <ArrowUpFromLine size={20} className="text-blue-600" />
              </div>

              <p className="text-sm text-[#718198]">Total Penukaran</p>

              <p className="mt-1 text-2xl font-bold text-[#172b4d]">
                {nasabah.penukaranPoins?.length || 0}
              </p>
            </div>
          </div>

          {/* =================================================
              INFORMASI DASAR
          ================================================= */}

          <div className="mb-6 rounded-2xl border border-[#e3e8ef] bg-white shadow-sm">
            <div className="border-b border-[#e3e8ef] px-5 py-5 sm:px-6">
              <h2 className="font-semibold text-[#172b4d]">Informasi Dasar</h2>
            </div>

            <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
              {/* NAMA */}

              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9fbf4]">
                  <User size={18} className="text-[#07966f]" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-[#718198]">Nama Nasabah</p>

                  <p className="mt-1 break-words text-sm font-semibold text-[#304563]">
                    {nasabah.namaNasabah}
                  </p>
                </div>
              </div>

              {/* TELEPON */}

              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9fbf4]">
                  <Phone size={18} className="text-[#07966f]" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-[#718198]">Nomor Telepon</p>

                  <p className="mt-1 break-words text-sm font-semibold text-[#304563]">
                    {nasabah.telp}
                  </p>
                </div>
              </div>

              {/* ALAMAT */}

              <div className="flex gap-3 md:col-span-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9fbf4]">
                  <MapPin size={18} className="text-[#07966f]" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-[#718198]">Alamat</p>

                  <p className="mt-1 break-words text-sm font-semibold text-[#304563]">
                    {nasabah.alamat}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              INFORMASI AKUN
          ================================================= */}

          <div className="mb-6 rounded-2xl border border-[#e3e8ef] bg-white shadow-sm">
            <div className="border-b border-[#e3e8ef] px-5 py-5 sm:px-6">
              <h2 className="font-semibold text-[#172b4d]">Informasi Akun</h2>
            </div>

            <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
              <div className="min-w-0">
                <p className="text-xs text-[#718198]">Username</p>

                <p className="mt-1 break-all text-sm font-semibold text-[#304563]">
                  {nasabah.user?.username || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#718198]">Role</p>

                <p className="mt-1 text-sm font-semibold text-[#304563]">
                  {nasabah.user?.role || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#718198]">Dibuat</p>

                <div className="mt-1 flex items-start gap-2 text-sm font-semibold text-[#304563]">
                  <CalendarDays
                    size={16}
                    className="mt-0.5 shrink-0 text-[#718198]"
                  />

                  <span>
                    {new Date(nasabah.createdAt).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#718198]">Terakhir diperbarui</p>

                <div className="mt-1 flex items-start gap-2 text-sm font-semibold text-[#304563]">
                  <CalendarDays
                    size={16}
                    className="mt-0.5 shrink-0 text-[#718198]"
                  />

                  <span>
                    {new Date(nasabah.updatedAt).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              SYSTEM ID
          ================================================= */}

          <div className="rounded-2xl border border-[#e3e8ef] bg-white shadow-sm">
            <div className="border-b border-[#e3e8ef] px-5 py-5 sm:px-6">
              <h2 className="font-semibold text-[#172b4d]">Informasi Sistem</h2>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div>
                <p className="text-xs text-[#718198]">Nasabah ID</p>

                <p className="mt-1 break-all font-mono text-xs text-[#304563]">
                  {nasabah.id}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#718198]">User ID</p>

                <p className="mt-1 break-all font-mono text-xs text-[#304563]">
                  {nasabah.userId}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#718198]">App Maker ID</p>

                <p className="mt-1 break-all font-mono text-xs text-[#304563]">
                  {nasabah.appMakerId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
