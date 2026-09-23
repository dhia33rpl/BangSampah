"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Recycle,
  Loader2,
  Tag,
  Coins,
  Scale,
  CalendarDays,
  ImageIcon,
  Pencil,
} from "lucide-react";
import AdminSidebar from "../../../../components/AdminSidebar";

type KategoriSampah = {
  id: string;
  appMakerId: string;
  namaKategori: string;
  hargaPerKg: number;
  poinPerKg: number;
  jenis: string;
  foto?: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: KategoriSampah;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

export default function DetailKategoriPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [kategori, setKategori] = useState<KategoriSampah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getFotoUrl = (foto?: string) => {
    if (!foto) return "";

    if (foto.startsWith("http")) {
      return foto;
    }

    const serverUrl = BASE_URL.replace(/\/api\/v1\/?$/, "");
    const path = foto.startsWith("/") ? foto : `/${foto}`;

    return `${serverUrl}${path}`;
  };

  const formatTanggal = (tanggal?: string) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!id) return;

    const getDetailKategori = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        if (!BASE_URL) {
          throw new Error("NEXT_PUBLIC_API_BASE_URL belum ditemukan.");
        }

        if (!APP_KEY) {
          throw new Error("NEXT_PUBLIC_APP_KEY belum ditemukan.");
        }

        const response = await fetch(
          `${BASE_URL}/kategori-sampah/${id}?_=${Date.now()}`,
          {
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
          },
        );

        const result: ApiResponse = await response.json();

        console.log("GET DETAIL KATEGORI:", result);

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal mengambil detail kategori sampah.",
          );
        }

        setKategori(result.data);
      } catch (error) {
        console.error("GET DETAIL KATEGORI ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil detail kategori sampah.",
        );
      } finally {
        setLoading(false);
      }
    };

    getDetailKategori();
  }, [id, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fb]">
        <AdminSidebar />

        <div className="ml-0 min-h-screen pt-[88px] lg:ml-[278px]">
          <div className="flex min-h-[calc(100vh-88px)] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              Memuat detail kategori...
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !kategori) {
    return (
      <main className="min-h-screen bg-[#f7f9fb]">
        <AdminSidebar />

        <div className="ml-0 min-h-screen pt-[88px] lg:ml-[278px]">
          <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
            <button
              type="button"
              onClick={() => router.push("/admin/kategori")}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-600"
            >
              <ArrowLeft size={18} />
              Kembali ke Kategori
            </button>

            <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
              <p className="text-sm font-medium text-red-600">
                {error || "Data kategori tidak ditemukan."}
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fb]">
      <AdminSidebar />

      <div className="ml-0 min-h-screen pt-[88px] lg:ml-[278px]">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
          {/* BACK */}
          <button
            type="button"
            onClick={() => router.push("/admin/kategori")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-600"
          >
            <ArrowLeft size={18} />
            Kembali ke Kategori Sampah
          </button>

          {/* HEADER */}
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100">
                <Recycle size={24} className="text-green-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Detail Kategori Sampah
                </h1>

                <p className="mt-1 text-sm text-gray-400">
                  Informasi lengkap kategori sampah daur ulang
                </p>
              </div>
            </div>

            {/* EDIT */}
            <button
              type="button"
              onClick={() => router.push(`/admin/kategori/${id}/edit`)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 sm:w-auto"
            >
              <Pencil size={17} />
              Edit
            </button>
          </div>

          {/* CONTENT */}
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            {/* FOTO */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="aspect-square overflow-hidden rounded-xl bg-gray-50">
                {kategori.foto ? (
                  <img
                    src={`${getFotoUrl(kategori.foto)}?v=${Date.now()}`}
                    alt={kategori.namaKategori}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon size={60} className="text-gray-200" />
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                  <Recycle size={18} className="text-green-600" />
                </div>

                <div>
                  <p className="text-xs text-gray-400">Jenis Sampah</p>

                  <p className="text-sm font-semibold capitalize text-gray-700">
                    {kategori.jenis}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="space-y-6">
              {/* INFORMASI KATEGORI */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-base font-bold text-gray-800">
                  Informasi Kategori
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* NAMA */}
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Tag size={17} className="text-green-600" />

                      <p className="text-xs font-medium text-gray-400">
                        Nama Kategori
                      </p>
                    </div>

                    <p className="text-base font-semibold text-gray-700">
                      {kategori.namaKategori}
                    </p>
                  </div>

                  {/* JENIS */}
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Recycle size={17} className="text-green-600" />

                      <p className="text-xs font-medium text-gray-400">Jenis</p>
                    </div>

                    <p className="text-base font-semibold capitalize text-gray-700">
                      {kategori.jenis}
                    </p>
                  </div>

                  {/* HARGA */}
                  <div className="rounded-xl bg-green-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Coins size={17} className="text-green-600" />

                      <p className="text-xs font-medium text-green-600">
                        Harga per Kg
                      </p>
                    </div>

                    <p className="text-xl font-bold text-green-700">
                      Rp {Number(kategori.hargaPerKg).toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* POIN */}
                  <div className="rounded-xl bg-green-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Scale size={17} className="text-green-600" />

                      <p className="text-xs font-medium text-green-600">
                        Poin per Kg
                      </p>
                    </div>

                    <p className="text-xl font-bold text-green-700">
                      {kategori.poinPerKg} poin
                    </p>
                  </div>
                </div>
              </div>

              {/* INFORMASI SISTEM */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-base font-bold text-gray-800">
                  Informasi Sistem
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* DIBUAT */}
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                      <CalendarDays size={18} className="text-gray-400" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Dibuat</p>

                      <p className="text-sm font-semibold text-gray-600">
                        {formatTanggal(kategori.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* DIPERBARUI */}
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                      <CalendarDays size={18} className="text-gray-400" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Terakhir diperbarui
                      </p>

                      <p className="text-sm font-semibold text-gray-600">
                        {formatTanggal(kategori.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
