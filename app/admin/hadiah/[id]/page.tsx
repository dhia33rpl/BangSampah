"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Gift,
  Pencil,
  Package,
  Star,
  CalendarDays,
  Trash2,
  Loader2,
} from "lucide-react";
import AdminSidebar from "../../../../components/AdminSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

interface Hadiah {
  id: string;
  appMakerId: string;
  namaHadiah: string;
  poinDibutuhkan: number;
  stok: number;
  foto?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Hadiah;
}

interface DeleteResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    id: string;
  };
}

const getFotoUrl = (foto?: string) => {
  if (!foto) return "";

  const baseFotoUrl = BASE_URL.replace(/\/api\/v1\/?$/, "");
  return `${baseFotoUrl}${foto}`;
};

const formatTanggal = (tanggal?: string) => {
  if (!tanggal) return "-";

  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function AdminHadiahDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [hadiah, setHadiah] = useState<Hadiah | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fetchDetailHadiah = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      if (!BASE_URL) {
        setError("NEXT_PUBLIC_API_BASE_URL belum ditemukan.");
        return;
      }

      if (!APP_KEY) {
        setError("NEXT_PUBLIC_APP_KEY belum ditemukan.");
        return;
      }

      const response = await fetch(`${BASE_URL}/hadiah/${id}?_=${Date.now()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      console.log("GET DETAIL HADIAH:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil detail hadiah.");
      }

      setHadiah(result.data);
    } catch (err) {
      console.error("GET DETAIL HADIAH ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil detail hadiah.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetailHadiah();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!hadiah) return;

    const yakin = window.confirm(
      `Apakah kamu yakin ingin menghapus hadiah "${hadiah.namaHadiah}"?`,
    );

    if (!yakin) return;

    try {
      setDeleting(true);
      setDeleteError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setDeleteError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      if (!BASE_URL) {
        setDeleteError("NEXT_PUBLIC_API_BASE_URL belum ditemukan.");
        return;
      }

      if (!APP_KEY) {
        setDeleteError("NEXT_PUBLIC_APP_KEY belum ditemukan.");
        return;
      }

      const response = await fetch(`${BASE_URL}/hadiah/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      const result: DeleteResponse = await response.json();

      console.log("DELETE HADIAH:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus data hadiah.");
      }

      alert(result.message || "Hadiah berhasil dihapus.");

      router.push("/admin/hadiah");
      router.refresh();
    } catch (err) {
      console.error("DELETE HADIAH ERROR:", err);

      setDeleteError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus hadiah.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminSidebar />

      {/* MAIN */}
      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="mx-auto max-w-5xl p-5 sm:p-7 lg:p-10">
          {/* BACK */}
          <Link
            href="/admin/hadiah"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#07966f]"
          >
            <ArrowLeft size={18} />
            Kembali ke Katalog Hadiah
          </Link>

          {/* LOADING */}
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={30} className="animate-spin text-[#07966f]" />

                <p className="text-sm text-gray-500">Memuat detail hadiah...</p>
              </div>
            </div>
          ) : error ? (
            /* ERROR */
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={fetchDetailHadiah}
                className="mt-5 rounded-xl bg-[#07966f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#067f5e]"
              >
                Coba Lagi
              </button>
            </div>
          ) : hadiah ? (
            <div className="space-y-6">
              {/* HEADER */}
              <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100">
                    <Gift size={25} className="text-[#07966f]" />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-[#172b4d]">
                      Detail Hadiah
                    </h1>

                    <p className="mt-1 text-sm text-[#718198]">
                      Informasi lengkap hadiah
                    </p>
                  </div>
                </div>

                {/* BUTTON */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/admin/hadiah/${id}/edit`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#07966f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#067f5e]"
                  >
                    <Pencil size={17} />
                    Edit Hadiah
                  </Link>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Trash2 size={17} />
                    )}

                    {deleting ? "Menghapus..." : "Hapus Hadiah"}
                  </button>
                </div>
              </div>

              {/* DELETE ERROR */}
              {deleteError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {deleteError}
                </div>
              )}

              {/* DETAIL */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* FOTO */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex h-[360px] items-center justify-center bg-gray-100 sm:h-[420px]">
                    {hadiah.foto ? (
                      <img
                        src={getFotoUrl(hadiah.foto)}
                        alt={hadiah.namaHadiah}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Gift size={60} />

                        <p className="mt-3 text-sm">Tidak ada foto hadiah</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* INFO */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                  <p className="mb-2 text-sm text-[#718198]">Nama Hadiah</p>

                  <h2 className="break-words text-2xl font-bold text-[#172b4d]">
                    {hadiah.namaHadiah}
                  </h2>

                  {/* POIN */}
                  <div className="mt-7 flex items-center gap-4 rounded-xl bg-green-50 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-100">
                      <Star size={22} className="text-[#07966f]" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Poin Dibutuhkan</p>

                      <p className="mt-1 text-xl font-bold text-[#07966f]">
                        {hadiah.poinDibutuhkan.toLocaleString("id-ID")} Pts
                      </p>
                    </div>
                  </div>

                  {/* STOK */}
                  <div className="mt-4 flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <Package size={22} className="text-gray-600" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Stok Tersedia</p>

                      <p className="mt-1 text-xl font-bold text-[#172b4d]">
                        {hadiah.stok}
                      </p>
                    </div>
                  </div>

                  {/* CREATED */}
                  <div className="mt-4 flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <CalendarDays size={22} className="text-gray-600" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Ditambahkan</p>

                      <p className="mt-1 text-sm font-semibold text-[#172b4d]">
                        {formatTanggal(hadiah.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* UPDATED */}
                  {hadiah.updatedAt && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-400">
                        Terakhir diperbarui
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatTanggal(hadiah.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ID */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-gray-400">ID Hadiah</p>

                <p className="mt-2 break-all text-sm font-medium text-gray-600">
                  {hadiah.id}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
