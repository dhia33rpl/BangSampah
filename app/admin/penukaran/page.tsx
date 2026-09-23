"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock3,
  Gift,
  Coins,
  CalendarDays,
} from "lucide-react";
import AdminSidebar from "../../../components/AdminSidebar";

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
  appMakerId: string;
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

export default function AdminPenukaranPage() {
  const router = useRouter();

  const [data, setData] = useState<Penukaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bulan, setBulan] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPenukaran = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/penukaran-poin/admin/list?bulan=${bulan}&_=${Date.now()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "x-app-key": APP_KEY,
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mengambil data penukaran poin"
        );
      }

      setData(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenukaran();
  }, [bulan]);

  const updateStatus = async (id: string) => {
    try {
      setUpdatingId(id);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/penukaran-poin/admin/status/${id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "x-app-key": APP_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "selesai",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mengubah status penukaran"
        );
      }

      await fetchPenukaran();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Gagal mengubah status penukaran"
      );
    } finally {
      setUpdatingId(null);
    }
  };

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

  const filteredData = data.filter((item) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      item.kodePenukaran.toLowerCase().includes(keyword) ||
      item.nasabah?.namaNasabah?.toLowerCase().includes(keyword) ||
      item.hadiah?.namaHadiah?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "semua" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPoin = filteredData.reduce(
    (total, item) => total + Number(item.poinTerpakai || 0),
    0
  );

  const totalDiproses = filteredData.filter(
    (item) => item.status === "diproses"
  ).length;

  const totalSelesai = filteredData.filter(
    (item) => item.status === "selesai"
  ).length;

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <AdminSidebar />

      <main className="ml-0 min-h-screen w-full bg-[#f7f9fb] pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="mx-auto max-w-7xl p-5 md:p-8">

          {/* HEADER */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#172b4d]">
                Penukaran Poin
              </h1>

              <p className="mt-1 text-sm text-[#718198]">
                Kelola transaksi penukaran poin hadiah nasabah
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPenukaran}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-xl border border-[#e3e8ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#172b4d] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* SUMMARY */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#718198]">
                    Total Transaksi
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#172b4d]">
                    {filteredData.length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9fbf4] text-[#07966f]">
                  <Gift size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#718198]">
                    Total Poin
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#172b4d]">
                    {totalPoin.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9fbf4] text-[#07966f]">
                  <Coins size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#718198]">
                    Diproses
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#172b4d]">
                    {totalDiproses}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                  <Clock3 size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#718198]">
                    Selesai
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#172b4d]">
                    {totalSelesai}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <CheckCircle2 size={21} />
                </div>
              </div>
            </div>

          </div>

          {/* FILTER */}
          <div className="mb-6 rounded-2xl border border-[#e3e8ef] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-[180px_1fr_180px]">

              {/* BULAN */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#172b4d]">
                  Bulan
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718198]"
                  />

                  <input
                    type="month"
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    className="w-full rounded-xl border border-[#e3e8ef] bg-white py-2.5 pl-10 pr-3 text-sm text-[#172b4d] outline-none transition focus:border-[#07966f]"
                  />
                </div>
              </div>

              {/* SEARCH */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#172b4d]">
                  Cari Transaksi
                </label>

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718198]"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari kode, nama nasabah, atau hadiah..."
                    className="w-full rounded-xl border border-[#e3e8ef] bg-white py-2.5 pl-10 pr-3 text-sm text-[#172b4d] outline-none transition placeholder:text-[#a0aaba] focus:border-[#07966f]"
                  />
                </div>
              </div>

              {/* STATUS */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#172b4d]">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-[#e3e8ef] bg-white px-3 py-2.5 text-sm text-[#172b4d] outline-none transition focus:border-[#07966f]"
                >
                  <option value="semua">Semua Status</option>
                  <option value="diproses">Diproses</option>
                  <option value="selesai">Selesai</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>

            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={fetchPenukaran}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#e3e8ef] bg-white md:block">

            <div className="border-b border-[#e3e8ef] px-6 py-5">
              <h2 className="font-bold text-[#172b4d]">
                Daftar Transaksi Penukaran
              </h2>

              <p className="mt-1 text-sm text-[#718198]">
                Menampilkan transaksi pada bulan{" "}
                {new Date(`${bulan}-01`).toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm text-[#718198]">
                Memuat data penukaran...
              </div>
            ) : filteredData.length === 0 ? (
              <div className="p-10 text-center">
                <Gift
                  size={35}
                  className="mx-auto text-[#a0aaba]"
                />

                <p className="mt-3 text-sm font-semibold text-[#172b4d]">
                  Tidak ada transaksi
                </p>

                <p className="mt-1 text-sm text-[#718198]">
                  Belum ada transaksi sesuai filter yang dipilih.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e3e8ef] bg-[#f9fafb] text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Kode
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Nasabah
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Hadiah
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Tanggal
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Poin
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#718198]">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#e3e8ef] last:border-b-0 hover:bg-[#fafdfb]"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-[#172b4d]">
                            {item.kodePenukaran}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-[#172b4d]">
                            {item.nasabah?.namaNasabah || "-"}
                          </p>

                          <p className="mt-1 text-xs text-[#718198]">
                            {item.nasabah?.telp || "-"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-[#172b4d]">
                            {item.hadiah?.namaHadiah || "-"}
                          </p>

                          <p className="mt-1 text-xs text-[#718198]">
                            {item.hadiah?.poinDibutuhkan?.toLocaleString(
                              "id-ID"
                            )}{" "}
                            poin
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-[#718198]">
                          {formatTanggal(item.tanggal)}
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-[#07966f]">
                            {Number(
                              item.poinTerpakai
                            ).toLocaleString("id-ID")}{" "}
                            poin
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/admin/penukaran/${item.id}`
                                )
                              }
                              title="Detail"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3e8ef] text-[#718198] transition hover:border-[#07966f] hover:text-[#07966f]"
                            >
                              <Eye size={17} />
                            </button>

                            {item.status === "diproses" && (
                              <button
                                type="button"
                                onClick={() => updateStatus(item.id)}
                                disabled={updatingId === item.id}
                                className="rounded-lg bg-[#07966f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#067f5d] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {updatingId === item.id
                                  ? "..."
                                  : "Selesaikan"}
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* MOBILE */}
          <div className="space-y-4 md:hidden">

            {loading ? (
              <div className="rounded-2xl border border-[#e3e8ef] bg-white p-8 text-center text-sm text-[#718198]">
                Memuat data penukaran...
              </div>
            ) : filteredData.length === 0 ? (
              <div className="rounded-2xl border border-[#e3e8ef] bg-white p-8 text-center">
                <Gift
                  size={35}
                  className="mx-auto text-[#a0aaba]"
                />

                <p className="mt-3 text-sm font-semibold text-[#172b4d]">
                  Tidak ada transaksi
                </p>
              </div>
            ) : (
              filteredData.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#718198]">
                        Kode Penukaran
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#172b4d]">
                        {item.kodePenukaran}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <div className="my-4 border-t border-[#e3e8ef]" />

                  <div className="space-y-4">

                    <div>
                      <p className="text-xs text-[#718198]">
                        Nasabah
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#172b4d]">
                        {item.nasabah?.namaNasabah || "-"}
                      </p>

                      <p className="mt-1 text-xs text-[#718198]">
                        {item.nasabah?.telp || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#718198]">
                        Hadiah
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#172b4d]">
                        {item.hadiah?.namaHadiah || "-"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div>
                        <p className="text-xs text-[#718198]">
                          Tanggal
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#172b4d]">
                          {formatTanggal(item.tanggal)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#718198]">
                          Poin
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#07966f]">
                          {Number(
                            item.poinTerpakai
                          ).toLocaleString("id-ID")}{" "}
                          poin
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="mt-5 flex gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/penukaran/${item.id}`
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e3e8ef] px-4 py-2.5 text-sm font-semibold text-[#172b4d] transition hover:border-[#07966f] hover:text-[#07966f]"
                    >
                      <Eye size={17} />
                      Detail
                    </button>

                    {item.status === "diproses" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(item.id)}
                        disabled={updatingId === item.id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#07966f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#067f5d] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 size={17} />

                        {updatingId === item.id
                          ? "..."
                          : "Selesaikan"}
                      </button>
                    )}

                  </div>
                </div>
              ))
            )}

          </div>

        </div>
      </main>
    </>
  );
}