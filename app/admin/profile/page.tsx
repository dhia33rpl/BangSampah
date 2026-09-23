"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  Phone,
  AtSign,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import AdminSidebar from "../../../components/AdminSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY;

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

export default function AdminProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatTanggal = (tanggal?: string) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const fetchProfile = async () => {
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

      const response = await fetch(`${BASE_URL}/auth/me?_=${Date.now()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data profile.");
      }

      setProfile(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const admin = profile?.adminBank;

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminSidebar />

      <main className="ml-0 min-h-screen w-full pt-[88px] lg:ml-[278px] lg:w-[calc(100%-278px)]">
        <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
          {/* HEADER */}
          <div className="mb-7">
            <p className="mb-1 text-sm font-medium text-[#07966f]">
              Profile Admin
            </p>

            <h1 className="text-2xl font-bold text-[#172b4d]">Profile Saya</h1>

            <p className="mt-1 text-sm text-[#718198]">
              Informasi akun admin dan data unit Bank Sampah.
            </p>
          </div>

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-red-600">{error}</p>

              <button
                type="button"
                onClick={fetchProfile}
                className="mt-4 rounded-xl bg-[#07966f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#067f5e]"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="space-y-5">
              {/* PROFILE SKELETON */}
              <div className="rounded-2xl border border-[#e3e8ef] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-6 w-44 animate-pulse rounded bg-[#eef2f5]" />

                    <div className="mt-3 h-4 w-28 animate-pulse rounded bg-[#eef2f5]" />
                  </div>

                  <div className="h-9 w-24 animate-pulse rounded-full bg-[#eef2f5]" />
                </div>
              </div>

              {/* ACCOUNT SKELETON */}
              <div className="rounded-2xl border border-[#e3e8ef] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-[#eef2f5]" />

                  <div>
                    <div className="h-4 w-32 animate-pulse rounded bg-[#eef2f5]" />

                    <div className="mt-2 h-3 w-48 animate-pulse rounded bg-[#eef2f5]" />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="h-20 animate-pulse rounded-xl bg-[#f5f7f9]" />
                  <div className="h-20 animate-pulse rounded-xl bg-[#f5f7f9]" />
                  <div className="h-20 animate-pulse rounded-xl bg-[#f5f7f9] sm:col-span-2" />
                </div>
              </div>

              {/* UNIT SKELETON */}
              <div className="rounded-2xl border border-[#e3e8ef] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 h-5 w-52 animate-pulse rounded bg-[#eef2f5]" />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="h-20 animate-pulse rounded-xl bg-[#f5f7f9]" />
                  <div className="h-20 animate-pulse rounded-xl bg-[#f5f7f9]" />
                  <div className="h-20 animate-pulse rounded-xl bg-[#f5f7f9]" />
                  <div className="h-20 animate-pulse rounded-xl bg-[#f5f7f9]" />
                </div>
              </div>
            </div>
          )}

          {/* CONTENT */}
          {!loading && !error && profile && (
            <div className="space-y-5">
              {/* PROFILE UTAMA */}
              <div className="rounded-2xl border border-[#e3e8ef] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#718198]">
                      Nama Pengelola
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-[#172b4d]">
                      {admin?.namaPengelola || "Admin"}
                    </h2>

                    <p className="mt-1 text-sm text-[#718198]">
                      @{profile.username}
                    </p>
                  </div>

                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c8eee0] bg-[#e9fbf4] px-3.5 py-2 text-xs font-semibold text-[#008563]">
                    <ShieldCheck size={15} />
                    {profile.role}
                  </span>
                </div>
              </div>

              {/* INFORMASI AKUN */}
              <div className="rounded-2xl border border-[#e3e8ef] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9fbf4]">
                    <User size={20} className="text-[#07966f]" />
                  </div>

                  <div>
                    <h2 className="font-bold text-[#172b4d]">Informasi Akun</h2>

                    <p className="text-xs text-[#718198]">
                      Data akun admin yang sedang login.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* USERNAME */}
                  <div className="rounded-xl bg-[#f7f9fb] p-4">
                    <div className="flex items-center gap-2">
                      <AtSign size={16} className="text-[#07966f]" />

                      <p className="text-xs font-medium text-[#718198]">
                        Username
                      </p>
                    </div>

                    <p className="mt-2 text-sm font-bold text-[#172b4d]">
                      {profile.username}
                    </p>
                  </div>

                  {/* ROLE */}
                  <div className="rounded-xl bg-[#f7f9fb] p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#07966f]" />

                      <p className="text-xs font-medium text-[#718198]">Role</p>
                    </div>

                    <p className="mt-2 text-sm font-bold text-[#172b4d]">
                      {profile.role}
                    </p>
                  </div>

                  {/* TANGGAL AKUN */}
                  <div className="rounded-xl bg-[#f7f9fb] p-4 sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-[#07966f]" />

                      <p className="text-xs font-medium text-[#718198]">
                        Akun Dibuat
                      </p>
                    </div>

                    <p className="mt-2 text-sm font-bold text-[#172b4d]">
                      {formatTanggal(profile.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* INFORMASI UNIT */}
              <div className="rounded-2xl border border-[#e3e8ef] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9fbf4]">
                    <Building2 size={20} className="text-[#07966f]" />
                  </div>

                  <div>
                    <h2 className="font-bold text-[#172b4d]">
                      Informasi Unit Bank Sampah
                    </h2>

                    <p className="text-xs text-[#718198]">
                      Data unit Bank Sampah yang dikelola.
                    </p>
                  </div>
                </div>

                {admin ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* NAMA UNIT */}
                    <div className="rounded-xl border border-[#e3e8ef] bg-white p-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-[#07966f]" />

                        <p className="text-xs font-medium text-[#718198]">
                          Nama Unit
                        </p>
                      </div>

                      <p className="mt-2 text-sm font-bold text-[#172b4d]">
                        {admin.namaUnit}
                      </p>
                    </div>

                    {/* NAMA PENGELOLA */}
                    <div className="rounded-xl border border-[#e3e8ef] bg-white p-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-[#07966f]" />

                        <p className="text-xs font-medium text-[#718198]">
                          Nama Pengelola
                        </p>
                      </div>

                      <p className="mt-2 text-sm font-bold text-[#172b4d]">
                        {admin.namaPengelola}
                      </p>
                    </div>

                    {/* TELEPON */}
                    <div className="rounded-xl border border-[#e3e8ef] bg-white p-4">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-[#07966f]" />

                        <p className="text-xs font-medium text-[#718198]">
                          Nomor Telepon
                        </p>
                      </div>

                      <p className="mt-2 text-sm font-bold text-[#172b4d]">
                        {admin.telp}
                      </p>
                    </div>

                    {/* TERDAFTAR */}
                    <div className="rounded-xl border border-[#e3e8ef] bg-white p-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-[#07966f]" />

                        <p className="text-xs font-medium text-[#718198]">
                          Terdaftar
                        </p>
                      </div>

                      <p className="mt-2 text-sm font-bold text-[#172b4d]">
                        {formatTanggal(admin.createdAt)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-700">
                      Data unit Bank Sampah tidak ditemukan.
                    </p>
                  </div>
                )}
              </div>

              
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
