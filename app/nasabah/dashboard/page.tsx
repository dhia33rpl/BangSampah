"use client";

import { useEffect, useState } from "react";
import { CirclePlus, List, Gift, ArrowRight, Recycle } from "lucide-react";
import Navbar from "@/components/NasabahSidebar";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY;

interface Setor {
  id: string;
  kodeSetor: string;
  tanggal: string;
  nasabahId: string;
  status: string;
  totalBeratKg: number;
  totalPoin: number;
  catatan: string;
}

interface DashboardData {
  saldoPoin: number;
  totalPengajuanSetor: number;
  totalPenukaranHadiah: number;
  totalPoinDiperoleh: number;
  setorTerakhir: Setor[];
  penukaranTerakhir: any[];
}

interface ProfileData {
  username: string;
  role: string;
  nasabah: {
    namaNasabah: string;
  } | null;
  adminBank: any | null;
}

export default function NasabahDashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token tidak ditemukan");
          return;
        }

        const headers = {
          Accept: "application/json",
          "x-app-key": APP_KEY || "",
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, dashboardResponse] = await Promise.all([
          fetch(`${BASE_URL}/auth/me`, {
            method: "GET",
            headers,
            cache: "no-store",
          }),

          fetch(`${BASE_URL}/dashboard/summary?_=${Date.now()}`, {
            method: "GET",
            headers,
            cache: "no-store",
          }),
        ]);

        const profileResult = await profileResponse.json();
        const dashboardResult = await dashboardResponse.json();

        console.log("PROFILE:", profileResult);
        console.log("DASHBOARD:", dashboardResult);

        if (profileResponse.ok && profileResult.success) {
          setProfile(profileResult.data);
        } else {
          console.error("Gagal mengambil profile:", profileResult);
        }

        if (dashboardResponse.ok && dashboardResult.success) {
          setDashboard(dashboardResult.data);
        } else {
          console.error("Gagal mengambil dashboard summary:", dashboardResult);
        }
      } catch (error) {
        console.error("Error mengambil dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  // ================= DATA USER =================

  const namaNasabah =
    profile?.nasabah?.namaNasabah || profile?.username || "Nasabah";

  // ================= DATA DASHBOARD =================

  const saldoPoin = dashboard?.saldoPoin ?? 0;

  const totalSetoran = dashboard?.totalPengajuanSetor ?? 0;

  // Jumlah seluruh berat sampah dari setorTerakhir
  const totalBerat =
    dashboard?.setorTerakhir?.reduce(
      (total, setor) => total + Number(setor.totalBeratKg || 0),
      0,
    ) ?? 0;

  const aktivitas = dashboard?.setorTerakhir ?? [];

  // ================= FORMAT =================

  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "menunggu_konfirmasi":
        return "Menunggu Konfirmasi";

      case "diverifikasi":
        return "Diverifikasi";

      case "selesai":
        return "Selesai";

      case "ditolak":
        return "Ditolak";

      default:
        return status || "-";
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#172b4d]">
      {/* NAVBAR + SIDEBAR */}
      <Navbar />

      {/* ================= CONTENT ================= */}
      <main className="lg:ml-[275px] pt-[88px] min-h-screen">
        <div className="p-4 sm:p-6 lg:p-[34px]">
          {/* ================= HERO ================= */}
          <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#079f76] to-[#087c6a] min-h-[297px] px-7 py-7 sm:px-9 sm:py-8 text-white shadow-sm">
            {/* TEXT */}
            <div className="relative z-10 max-w-[650px]">
              <span className="inline-flex items-center rounded-full bg-[#10aa80] px-4 py-1.5 text-xs font-semibold">
                Selamat Datang Kembali!
              </span>

              <h1 className="mt-3 text-[30px] sm:text-[34px] font-bold leading-tight">
                Halo, {loading ? "..." : namaNasabah}!
              </h1>

              <p className="mt-1 max-w-[650px] text-[15px] leading-6 text-white">
                Terima kasih telah aktif berpartisipasi menjaga kebersihan
                lingkungan dan mendaur ulang sampah.
              </p>

              {/* PEMBATAS */}
              <div className="mt-6 h-px bg-white/20 max-w-[620px]" />

              {/* STAT */}
              <div className="mt-6 flex flex-wrap gap-8 sm:gap-16">
                {/* SALDO */}
                <div>
                  <p className="text-xs font-semibold text-[#d1fff3]">
                    TOTAL SALDO POIN
                  </p>

                  <p className="mt-1 text-[27px] font-bold">
                    {loading ? "..." : saldoPoin.toLocaleString("id-ID")} Pts
                  </p>
                </div>

                {/* TOTAL SETORAN */}
                <div>
                  <p className="text-xs font-semibold text-[#d1fff3]">
                    TOTAL SETORAN
                  </p>

                  <p className="mt-1 text-[27px] font-bold">
                    {loading ? "..." : totalSetoran} Kali
                  </p>
                </div>

                {/* TOTAL BERAT */}
                <div>
                  <p className="text-xs font-semibold text-[#d1fff3]">
                    SAMPAH DIDAUR ULANG
                  </p>

                  <p className="mt-1 text-[27px] font-bold">
                    {loading ? "..." : totalBerat.toFixed(1)} Kg
                  </p>
                </div>
              </div>
            </div>

            {/* ICON RECYCLE BESAR */}
            <div className="absolute right-[-10px] bottom-[-25px] opacity-[0.13]">
              <Recycle size={250} strokeWidth={1.4} />
            </div>
          </section>

          {/* ================= QUICK ACTION ================= */}
          <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SETOR */}
            <Link
              href="/nasabah/setoran"
              className="group bg-white border border-[#e0e7ef] rounded-2xl px-5 py-5 flex items-center gap-4 hover:border-[#b7e8d9] hover:shadow-sm transition"
            >
              <div className="w-[50px] h-[50px] rounded-xl bg-[#d8f9ed] flex items-center justify-center text-[#008d6b] shrink-0">
                <CirclePlus size={25} />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-[15px]">Ajukan Penyetoran</h3>

                <p className="text-sm text-[#718198] mt-1">
                  Jadwalkan pengantaran sampah baru
                </p>
              </div>

              <ArrowRight
                size={18}
                className="text-[#a0adbb] group-hover:text-[#07966f] transition"
              />
            </Link>

            {/* HARGA */}
            <Link
              href="/nasabah/daftarsampah"
              className="group bg-white border border-[#e0e7ef] rounded-2xl px-5 py-5 flex items-center gap-4 hover:border-[#b7e8d9] hover:shadow-sm transition"
            >
              <div className="w-[50px] h-[50px] rounded-xl bg-[#e2edff] flex items-center justify-center text-[#2563eb] shrink-0">
                <List size={25} />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-[15px]">Cek Harga Sampah</h3>

                <p className="text-sm text-[#718198] mt-1">
                  Lihat tarif per kg & perolehan poin
                </p>
              </div>

              <ArrowRight
                size={18}
                className="text-[#a0adbb] group-hover:text-[#07966f] transition"
              />
            </Link>

            {/* VOUCHER */}
            <Link
              href="/nasabah/hadiah"
              className="group bg-white border border-[#e0e7ef] rounded-2xl px-5 py-5 flex items-center gap-4 hover:border-[#b7e8d9] hover:shadow-sm transition"
            >
              <div className="w-[50px] h-[50px] rounded-xl bg-[#fff2c9] flex items-center justify-center text-[#d98a00] shrink-0">
                <Gift size={25} />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-[15px]">Tukar Voucher</h3>

                <p className="text-sm text-[#718198] mt-1">
                  Gunakan poin untuk hadiah menarik
                </p>
              </div>

              <ArrowRight
                size={18}
                className="text-[#a0adbb] group-hover:text-[#07966f] transition"
              />
            </Link>
          </section>

          {/* ================= AKTIVITAS ================= */}
          <section className="mt-6 bg-white border border-[#e0e7ef] rounded-2xl min-h-[148px]">
            <div className="px-6 py-5 flex items-center justify-between">
              <h2 className="font-bold text-[17px]">
                Aktivitas & Status Terbaru
              </h2>

              <Link
                href="/nasabah/histori"
                className="text-sm font-semibold text-[#07966f] hover:underline"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="px-6 pb-8">
              {loading ? (
                <div className="flex justify-center">
                  <p className="text-sm text-[#91a3bb] mt-2">
                    Memuat aktivitas...
                  </p>
                </div>
              ) : aktivitas.length === 0 ? (
                <div className="flex justify-center">
                  <p className="text-sm text-[#91a3bb] mt-2">
                    Belum ada aktivitas penyetoran sampah.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aktivitas.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-xl border border-[#edf1f5] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {/* KIRI */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e9fbf4] text-[#07966f]">
                          <Recycle size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#172b4d]">
                            {item.kodeSetor}
                          </p>

                          <p className="text-xs text-[#718198]">
                            {formatTanggal(item.tanggal)}
                          </p>
                        </div>
                      </div>

                      {/* KANAN */}
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-semibold text-[#07966f]">
                          {formatStatus(item.status)}
                        </p>

                        <p className="text-xs text-[#718198]">
                          {item.totalBeratKg} Kg • +{item.totalPoin} Pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
