"use client";

import { useEffect, useState } from "react";
import { User, Phone, MapPin, ShieldCheck, Wallet } from "lucide-react";
import Navbar from "@/components/NasabahSidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY;

interface Nasabah {
  id: string;
  appMakerId: string;
  userId: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  saldoPoin: number;
  foto?: string | null;
}

interface ProfileData {
  id: string;
  appMakerId: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  nasabah: Nasabah | null;
  adminBank: null;
}

export default function NasabahProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token tidak ditemukan");
          return;
        }

        const response = await fetch(`${BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "x-app-key": APP_KEY || "",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          console.error("Gagal mengambil profile:", result);
          return;
        }

        setProfile(result.data);
      } catch (error) {
        console.error("Error mengambil profile:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const nasabah = profile?.nasabah;

  const getFotoUrl = (foto?: string | null) => {
    if (!foto) return "";

    const baseFotoUrl = BASE_URL?.replace(/\/api\/v1\/?$/, "");

    return `${baseFotoUrl}${foto}`;
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#172b4d]">
      {/* SIDEBAR */}
      <Navbar />

      {/* CONTENT */}
      <main className="min-h-screen pt-[88px] lg:ml-[275px]">
        <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-[34px]">
          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#172b4d] sm:text-[28px]">
              Profile
            </h1>

            <p className="mt-1 text-sm text-[#718198]">
              Kelola informasi akun dan data diri kamu.
            </p>
          </div>

          {/* PROFILE CARD */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            {/* PROFILE LEFT */}
            <section className="rounded-2xl border border-[#e0e7ef] bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                {/* FOTO */}
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#e9fbf4]">
                  {nasabah?.foto ? (
                    <img
                      src={getFotoUrl(nasabah.foto)}
                      alt="Foto profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-[#07966f]" />
                  )}
                </div>

                {/* NAME */}
                <h2 className="mt-4 text-xl font-bold text-[#172b4d]">
                  {loading
                    ? "Memuat..."
                    : nasabah?.namaNasabah || profile?.username || "Nasabah"}
                </h2>

                {/* USERNAME */}
                <p className="mt-1 text-sm text-[#718198]">
                  @{profile?.username || "-"}
                </p>

                {/* ROLE */}
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#e9fbf4] px-4 py-2 text-xs font-semibold text-[#008563]">
                  <ShieldCheck size={15} />
                  Nasabah
                </div>
              </div>

              {/* SALDO */}
              <div className="mt-6 rounded-xl bg-[#075c47] p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <Wallet size={20} />
                  </div>

                  <div>
                    <p className="text-xs text-green-100">Saldo Poin</p>

                    <p className="mt-1 text-xl font-bold">
                      {loading
                        ? "..."
                        : (nasabah?.saldoPoin ?? 0).toLocaleString(
                            "id-ID",
                          )}{" "}
                      Pts
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* PROFILE RIGHT */}
            <section className="rounded-2xl border border-[#e0e7ef] bg-white p-5 shadow-sm sm:p-6">
              <div className="border-b border-[#e8edf2] pb-5">
                <h2 className="text-lg font-bold text-[#172b4d]">
                  Informasi Pribadi
                </h2>

                <p className="mt-1 text-sm text-[#718198]">
                  Informasi akun nasabah yang terdaftar.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* NAMA */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#91a3bb]">
                    Nama Lengkap
                  </p>

                  <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-[#e0e7ef] bg-[#fafbfc] px-4">
                    <User size={19} className="shrink-0 text-[#07966f]" />

                    <p className="break-words text-sm font-medium text-[#172b4d]">
                      {loading ? "Memuat..." : nasabah?.namaNasabah || "-"}
                    </p>
                  </div>
                </div>

                {/* USERNAME */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#91a3bb]">
                    Username
                  </p>

                  <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-[#e0e7ef] bg-[#fafbfc] px-4">
                    <User size={19} className="shrink-0 text-[#07966f]" />

                    <p className="break-all text-sm font-medium text-[#172b4d]">
                      {loading ? "Memuat..." : profile?.username || "-"}
                    </p>
                  </div>
                </div>

                {/* TELEPON */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#91a3bb]">
                    Nomor Telepon
                  </p>

                  <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-[#e0e7ef] bg-[#fafbfc] px-4">
                    <Phone size={19} className="shrink-0 text-[#07966f]" />

                    <p className="break-words text-sm font-medium text-[#172b4d]">
                      {loading ? "Memuat..." : nasabah?.telp || "-"}
                    </p>
                  </div>
                </div>

                {/* ROLE */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#91a3bb]">
                    Role
                  </p>

                  <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-[#e0e7ef] bg-[#fafbfc] px-4">
                    <ShieldCheck
                      size={19}
                      className="shrink-0 text-[#07966f]"
                    />

                    <p className="text-sm font-medium text-[#172b4d]">
                      {profile?.role || "-"}
                    </p>
                  </div>
                </div>

                {/* ALAMAT */}
                <div className="sm:col-span-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#91a3bb]">
                    Alamat
                  </p>

                  <div className="flex min-h-[80px] items-start gap-3 rounded-xl border border-[#e0e7ef] bg-[#fafbfc] px-4 py-4">
                    <MapPin
                      size={19}
                      className="mt-0.5 shrink-0 text-[#07966f]"
                    />

                    <p className="break-words text-sm leading-6 font-medium text-[#172b4d]">
                      {loading ? "Memuat..." : nasabah?.alamat || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
