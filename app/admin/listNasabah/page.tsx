"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Eye, Trash2, Loader2, Search } from "lucide-react";
import AdminSidebar from "../../../components/AdminSidebar";

type Nasabah = {
  id: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  saldoPoin: number;
  foto?: string;
  user?: {
    username: string;
    role: string;
  };
};

type ApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Nasabah[];
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

export default function ListNasabahPage() {
  const router = useRouter();

  const [nasabah, setNasabah] = useState<Nasabah[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const getNasabah = async () => {
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
        `${BASE_URL}/admin/nasabah?_=${Date.now()}`,
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

      console.log("GET LIST NASABAH:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data nasabah.");
      }

      setNasabah(result.data || []);
    } catch (error) {
      console.error("GET NASABAH ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data nasabah.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNasabah();
  }, []);

  const handleDelete = async (id: string, nama: string) => {
    const yakin = window.confirm(
      `Apakah kamu yakin ingin menghapus nasabah "${nama}"?`,
    );

    if (!yakin) return;

    try {
      setDeletingId(id);
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

      const response = await fetch(`${BASE_URL}/admin/nasabah/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      console.log("DELETE NASABAH:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Data nasabah gagal dihapus.");
      }

      setNasabah((dataLama) => dataLama.filter((item) => item.id !== id));

      alert(result.message || "Data nasabah berhasil dihapus.");
    } catch (error) {
      console.error("DELETE NASABAH ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menghapus data nasabah.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredNasabah = nasabah.filter((item) => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return true;

    return (
      item.namaNasabah?.toLowerCase().includes(keyword) ||
      item.user?.username?.toLowerCase().includes(keyword) ||
      item.telp?.toLowerCase().includes(keyword) ||
      item.alamat?.toLowerCase().includes(keyword)
    );
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fb]">
        <AdminSidebar />

        <div className="ml-0 min-h-screen pt-[100px] lg:ml-[278px]">
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              Memuat data nasabah...
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fb]">
      <AdminSidebar />

      <div className="ml-0 min-h-screen pt-[100px] lg:ml-[278px]">
        <div className="px-5 pb-10 md:px-8">
          {/* HEADER */}
          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5">
              {/* JUDUL */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100">
                  <Users size={23} className="text-green-600" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-[#172b4d]">Nasabah</h1>

                  <p className="mt-1 text-sm text-[#718198]">
                    Kelola data nasabah Bank Sampah
                  </p>
                </div>
              </div>

              {/* BUTTON TAMBAH */}
              <div className="flex w-full">
                <button
                  type="button"
                  onClick={() => router.push("/admin/listNasabah/add")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#07966f] px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#067f5e] sm:w-auto"
                >
                  <Plus size={19} />
                  Tambah Nasabah
                </button>
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* TABLE CARD */}
          <div className="overflow-hidden rounded-2xl border border-[#e3e8ef] bg-white shadow-sm">
            {/* SEARCH */}
            <div className="border-b border-[#e3e8ef] p-5">
              <div className="relative w-full max-w-md">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama, username, atau nomor telepon..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#07966f] focus:ring-2 focus:ring-[#e9fbf4]"
                />
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      No
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Nasabah
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Username
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      No. Telepon
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Saldo Poin
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredNasabah.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center">
                        <Users
                          size={40}
                          className="mx-auto mb-3 text-gray-200"
                        />

                        <p className="text-sm font-medium text-gray-500">
                          Tidak ada data nasabah
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Data nasabah belum tersedia
                        </p>

                        {/* BUTTON TAMBAH SAAT DATA KOSONG */}
                        <button
                          type="button"
                          onClick={() => router.push("/admin/listNasabah/add")}
                          className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-[#07966f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#067f5e]"
                        >
                          <Plus size={18} />
                          Tambah Nasabah
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredNasabah.map((item, index) => {
                      const sedangDihapus = deletingId === item.id;

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-gray-50"
                        >
                          {/* NO */}
                          <td className="px-5 py-4 text-sm text-gray-500">
                            {index + 1}
                          </td>

                          {/* NASABAH */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100 font-semibold text-green-600">
                                {item.foto ? (
                                  <img
                                    src={`${BASE_URL.replace(
                                      /\/api\/v1\/?$/,
                                      "",
                                    )}${item.foto}`}
                                    alt={item.namaNasabah}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  item.namaNasabah?.charAt(0).toUpperCase()
                                )}
                              </div>

                              <div>
                                <p className="font-semibold text-gray-700">
                                  {item.namaNasabah}
                                </p>

                                <p className="max-w-[250px] truncate text-xs text-gray-400">
                                  {item.alamat}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* USERNAME */}
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {item.user?.username || "-"}
                          </td>

                          {/* TELEPON */}
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {item.telp || "-"}
                          </td>

                          {/* POIN */}
                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-600">
                              {item.saldoPoin ?? 0} poin
                            </span>
                          </td>

                          {/* AKSI */}
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* DETAIL */}
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(`/admin/listNasabah/${item.id}`)
                                }
                                className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-green-50 hover:text-green-600"
                              >
                                <Eye size={16} />
                                Detail
                              </button>

                              {/* HAPUS */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(item.id, item.namaNasabah)
                                }
                                disabled={sedangDihapus}
                                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {sedangDihapus ? (
                                  <>
                                    <Loader2
                                      size={16}
                                      className="animate-spin"
                                    />
                                    Menghapus
                                  </>
                                ) : (
                                  <>
                                    <Trash2 size={16} />
                                    Hapus
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-100 px-5 py-4">
              <p className="text-xs text-gray-400">
                Menampilkan{" "}
                <span className="font-semibold text-gray-600">
                  {filteredNasabah.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-gray-600">
                  {nasabah.length}
                </span>{" "}
                nasabah
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
