"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Recycle,
  Eye,
  Trash2,
  Loader2,
  ImageIcon,
} from "lucide-react";
import AdminSidebar from "../../../components/AdminSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

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
  data: KategoriSampah[];
};

export default function KategoriPage() {
  const router = useRouter();

  const [kategori, setKategori] = useState<KategoriSampah[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // ==========================================
  // URL FOTO
  // ==========================================
  const getFotoUrl = (foto?: string) => {
    if (!foto) return "";

    if (foto.startsWith("http://") || foto.startsWith("https://")) {
      return foto;
    }

    const baseWithoutApi = BASE_URL.replace(/\/api\/v1\/?$/, "");

    if (foto.startsWith("/")) {
      return `${baseWithoutApi}${foto}`;
    }

    return `${baseWithoutApi}/${foto}`;
  };

  // ==========================================
  // GET DATA
  // ==========================================
  const fetchKategori = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/kategori-sampah?_=${Date.now()}`,
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
        throw new Error(
          result.message || "Gagal mengambil data kategori sampah.",
        );
      }

      setKategori(result.data || []);
    } catch (error) {
      console.error("Error mengambil kategori:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data kategori sampah.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  // ==========================================
  // DELETE
  // ==========================================
  const handleDelete = async (id: string) => {
    const konfirmasi = window.confirm(
      "Apakah kamu yakin ingin menghapus kategori sampah ini?",
    );

    if (!konfirmasi) return;

    try {
      setDeletingId(id);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const response = await fetch(`${BASE_URL}/kategori-sampah/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus kategori sampah.");
      }

      setKategori((dataLama) => dataLama.filter((item) => item.id !== id));

      window.alert(result.message || "Kategori sampah berhasil dihapus.");
    } catch (error) {
      console.error("Error menghapus kategori:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus kategori.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================
  const filteredKategori = kategori.filter((item) => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return true;

    return (
      item.namaKategori?.toLowerCase().includes(keyword) ||
      item.jenis?.toLowerCase().includes(keyword)
    );
  });

  // ==========================================
  // FORMAT RUPIAH
  // ==========================================
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <AdminSidebar />

        <main className="ml-0 flex min-h-screen w-full items-center justify-center pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)] lg:pt-0">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 size={24} className="animate-spin text-green-600" />

            <span>Memuat kategori sampah...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {/* ======================================
          SIDEBAR
      ======================================= */}
      <AdminSidebar />

      {/* ======================================
          MAIN
      ======================================= */}
      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
          {/* ==================================
              HEADER
          =================================== */}
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 sm:h-14 sm:w-14">
                <Recycle size={25} className="text-green-600 sm:h-7 sm:w-7" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                  Kategori Sampah
                </h1>

                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Kelola kategori sampah daur ulang
                </p>
              </div>
            </div>

            {/* TAMBAH */}
            <button
              type="button"
              onClick={() => router.push("/admin/kategori/add")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 sm:w-auto"
            >
              <Plus size={18} />
              Tambah Kategori
            </button>
          </div>

          {/* ==================================
              ERROR
          =================================== */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ==================================
              SEARCH
          =================================== */}
          <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
            <div className="relative w-full">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kategori atau jenis sampah..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          {/* ==================================
              DESKTOP TABLE
          =================================== */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      No
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Kategori
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Jenis
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Harga / Kg
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Poin / Kg
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredKategori.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <Recycle size={26} className="text-gray-400" />
                          </div>

                          <p className="text-sm font-medium text-gray-600">
                            Tidak ada kategori sampah
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Data kategori belum tersedia atau tidak ditemukan.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredKategori.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50 last:border-b-0"
                      >
                        {/* NO */}
                        <td className="px-6 py-5 text-sm text-gray-500">
                          {index + 1}
                        </td>

                        {/* KATEGORI */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                              {item.foto ? (
                                <img
                                  src={getFotoUrl(item.foto)}
                                  alt={item.namaKategori}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ImageIcon
                                  size={24}
                                  className="text-gray-400"
                                />
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {item.namaKategori}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                Kategori sampah
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* JENIS */}
                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold capitalize text-green-600">
                            {item.jenis}
                          </span>
                        </td>

                        {/* HARGA */}
                        <td className="px-6 py-5 text-sm font-semibold text-gray-700">
                          {formatRupiah(item.hargaPerKg)}
                        </td>

                        {/* POIN */}
                        <td className="px-6 py-5 text-sm font-semibold text-gray-700">
                          {item.poinPerKg} poin
                        </td>

                        {/* AKSI */}
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/admin/kategori/${item.id}`)
                              }
                              className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-600 transition hover:bg-green-100"
                            >
                              <Eye size={15} />
                              Detail
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === item.id ? (
                                <>
                                  <Loader2 size={15} className="animate-spin" />
                                  Menghapus...
                                </>
                              ) : (
                                <>
                                  <Trash2 size={15} />
                                  Hapus
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================================
              MOBILE CARD
          =================================== */}
          <div className="space-y-3 md:hidden">
            {filteredKategori.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white px-5 py-12 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <Recycle size={26} className="text-gray-400" />
                </div>

                <p className="text-sm font-medium text-gray-600">
                  Tidak ada kategori sampah
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Data kategori belum tersedia atau tidak ditemukan.
                </p>
              </div>
            ) : (
              filteredKategori.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  {/* CARD HEADER */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                      {item.foto ? (
                        <img
                          src={getFotoUrl(item.foto)}
                          alt={item.namaKategori}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={24} className="text-gray-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] text-gray-400">
                            #{index + 1}
                          </p>

                          <h3 className="mt-0.5 truncate text-sm font-bold text-gray-800">
                            {item.namaKategori}
                          </h3>
                        </div>

                        <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-green-600">
                          {item.jenis}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CARD INFO */}
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-[11px] text-gray-400">Harga / Kg</p>

                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {formatRupiah(item.hargaPerKg)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-400">Poin / Kg</p>

                      <p className="mt-1 text-sm font-semibold text-green-600">
                        {item.poinPerKg} poin
                      </p>
                    </div>
                  </div>

                  {/* CARD ACTION */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/kategori/${item.id}`)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-green-50 px-3 py-2.5 text-xs font-semibold text-green-600 transition hover:bg-green-100"
                    >
                      <Eye size={16} />
                      Detail
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Menghapus...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Hapus
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ==================================
              JUMLAH DATA
          =================================== */}
          <div className="mt-4 text-sm text-gray-400">
            Menampilkan{" "}
            <span className="font-semibold text-gray-600">
              {filteredKategori.length}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-gray-600">
              {kategori.length}
            </span>{" "}
            kategori
          </div>
        </div>
      </main>
    </div>
  );
}
