"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Tags, ClipboardList, Gift, Scale, Coins } from "lucide-react";
import AdminSidebar from "../../../components/AdminSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY;

interface DashboardStats {
  totalNasabah: number;
  totalKategoriSampah: number;
  totalTransaksiSetor: number;
  totalHadiah: number;
  totalBeratSampahKg: number;
  totalPoinTersalurkan: number;
}

interface AdminBank {
  id: string;
  appMakerId: string;
  userId: string;
  namaUnit: string;
  namaPengelola: string;
  telp: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileData {
  id: string;
  appMakerId: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  nasabah: null;
  adminBank: AdminBank | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
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

      const headers = {
        Accept: "application/json",
        "x-app-key": APP_KEY,
        Authorization: `Bearer ${token}`,
      };

      const [statsResponse, profileResponse] = await Promise.all([
        fetch(`${BASE_URL}/dashboard/stats?_=${Date.now()}`, {
          method: "GET",
          headers,
          cache: "no-store",
        }),

        fetch(`${BASE_URL}/auth/me?_=${Date.now()}`, {
          method: "GET",
          headers,
          cache: "no-store",
        }),
      ]);

      const statsResult = await statsResponse.json();
      const profileResult = await profileResponse.json();

      if (!statsResponse.ok || !statsResult.success) {
        throw new Error(
          statsResult.message || "Gagal mengambil statistik dashboard.",
        );
      }

      if (!profileResponse.ok || !profileResult.success) {
        throw new Error(
          profileResult.message || "Gagal mengambil profile admin.",
        );
      }

      setStats(statsResult.data);
      setProfile(profileResult.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const admin = profile?.adminBank;

  const statCards = [
    {
      title: "Total Nasabah",
      value: stats?.totalNasabah ?? 0,
      suffix: "Orang",
      icon: Users,
      href: "/admin/listNasabah",
    },
    {
      title: "Kategori Sampah",
      value: stats?.totalKategoriSampah ?? 0,
      suffix: "Kategori",
      icon: Tags,
      href: "/admin/kategori",
    },
    {
      title: "Transaksi Setoran",
      value: stats?.totalTransaksiSetor ?? 0,
      suffix: "Transaksi",
      icon: ClipboardList,
      href: "/admin/setoran",
    },
    {
      title: "Total Hadiah",
      value: stats?.totalHadiah ?? 0,
      suffix: "Hadiah",
      icon: Gift,
      href: "/admin/hadiah",
    },
    {
      title: "Total Sampah",
      value: stats?.totalBeratSampahKg ?? 0,
      suffix: "Kg",
      icon: Scale,
      href: "/admin/setoran",
    },
    {
      title: "Poin Tersalurkan",
      value: stats?.totalPoinTersalurkan ?? 0,
      suffix: "Poin",
      icon: Coins,
      href: "/admin/setoran",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminSidebar />

      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          {/* HEADER DASHBOARD */}
          <div className="mb-8">
            <p className="mb-1 text-sm font-medium text-[#07966f]">
              Dashboard Admin
            </p>

            <h1 className="text-2xl font-bold text-[#172b4d]">
              Selamat Datang,{" "}
              {loading ? "Admin" : admin?.namaPengelola || "Admin"} 👋
            </h1>

            <p className="mt-1 text-sm text-[#718198]">
              {admin?.namaUnit
                ? `Kelola dan pantau aktivitas ${admin.namaUnit}.`
                : "Pantau aktivitas Bank Sampah Bersih Mandiri."}
            </p>
          </div>

          {/* ERROR */}
          {!loading && error && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-red-600">{error}</p>

              <button
                type="button"
                onClick={fetchDashboard}
                className="mt-3 rounded-lg bg-[#07966f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#067f5e]"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* INFO ADMIN */}
          {!loading && !error && profile && (
            <div className="mb-6 rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e9fbf4]">
                    <Users size={22} className="text-[#07966f]" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#718198]">
                      Pengelola
                    </p>

                    <p className="text-base font-bold text-[#172b4d]">
                      {admin?.namaPengelola || "Admin"}
                    </p>

                    <p className="mt-0.5 text-xs text-[#718198]">
                      @{profile.username}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs font-medium text-[#718198]">
                    Unit Bank Sampah
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#172b4d]">
                    {admin?.namaUnit || "-"}
                  </p>

                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e9fbf4] px-3 py-1 text-xs font-semibold text-[#008563]">
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STATISTIC CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="group rounded-2xl border border-[#e3e8ef] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9fbf4]">
                      <Icon size={21} className="text-[#07966f]" />
                    </div>

                    <span className="text-xs font-medium text-[#9aa7b8]">
                      Statistik
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-medium text-[#718198]">
                      {item.title}
                    </p>

                    <div className="mt-1 flex items-baseline gap-2">
                      {loading ? (
                        <div className="h-8 w-20 animate-pulse rounded-lg bg-[#eef2f5]" />
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-[#172b4d]">
                            {item.value.toLocaleString("id-ID")}
                          </span>

                          <span className="text-xs font-medium text-[#718198]">
                            {item.suffix}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RINGKASAN */}
          {!loading && stats && (
            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* SAMPAH */}
              <div className="rounded-2xl border border-[#e3e8ef] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9fbf4]">
                    <Scale size={20} className="text-[#07966f]" />
                  </div>

                  <div>
                    <h2 className="font-bold text-[#172b4d]">
                      Ringkasan Sampah
                    </h2>

                    <p className="text-xs text-[#718198]">
                      Total sampah yang tercatat
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-[#07966f]">
                      {stats.totalBeratSampahKg.toLocaleString("id-ID")}
                    </p>

                    <p className="mt-1 text-sm text-[#718198]">
                      kilogram sampah
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#f7f9fb] px-4 py-3 text-right">
                    <p className="text-xs text-[#9aa7b8]">Transaksi</p>

                    <p className="mt-1 text-lg font-bold text-[#172b4d]">
                      {stats.totalTransaksiSetor.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>

              {/* POIN */}
              <div className="rounded-2xl border border-[#e3e8ef] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9fbf4]">
                    <Coins size={20} className="text-[#07966f]" />
                  </div>

                  <div>
                    <h2 className="font-bold text-[#172b4d]">Ringkasan Poin</h2>

                    <p className="text-xs text-[#718198]">
                      Total poin yang tersalurkan
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-[#07966f]">
                      {stats.totalPoinTersalurkan.toLocaleString("id-ID")}
                    </p>

                    <p className="mt-1 text-sm text-[#718198]">
                      poin tersalurkan
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#f7f9fb] px-4 py-3 text-right">
                    <p className="text-xs text-[#9aa7b8]">Nasabah</p>

                    <p className="mt-1 text-lg font-bold text-[#172b4d]">
                      {stats.totalNasabah.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-6 rounded-2xl bg-[#075c47] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-white">
                  {admin?.namaUnit || "Bank Sampah Bersih Mandiri"}
                </h2>

                <p className="mt-1 text-sm text-green-100">
                  Kelola data nasabah, sampah, setoran, dan hadiah dengan mudah.
                </p>
              </div>

              <div className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-green-50">
                Admin Dashboard
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
