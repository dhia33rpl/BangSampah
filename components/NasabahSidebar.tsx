"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  Recycle,
  LayoutDashboard,
  ClipboardList,
  History,
  Gift,
  Tags,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/nasabah/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Setoran",
    href: "/nasabah/setoran",
    icon: ClipboardList,
  },
  {
    label: "Histori Setoran",
    href: "/nasabah/histori",
    icon: History,
  },
  {
    label: "Riwayat Penukaran Poin",
    href: "/nasabah/riwayattukarhadiah",
    icon: History,
  },
  {
    label: "Kategori Sampah",
    href: "/nasabah/daftarsampah",
    icon: Tags,
  },
  {
    label: "Hadiah",
    href: "/nasabah/hadiah",
    icon: Gift,
  },
  {
    label: "Profile",
    href: "/nasabah/profile",
    icon: LayoutDashboard,
  },
];

export default function NasabahSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsOpen(false);
    router.push("/login");
  };

  return (
    <>
      {/* ================= TOP NAVBAR ================= */}
      <header className="fixed left-0 right-0 top-0 z-[100] h-[88px] border-b border-[#e3e8ef] bg-white">
        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-7">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#07966f]">
              <Recycle size={24} className="text-white" />
            </div>

            <div>
              <p className="text-base font-bold text-[#172b4d]">Bank Sampah</p>

              <p className="text-xs text-[#718198]">Bersih Mandiri</p>
            </div>
          </div>

          {/* HAMBURGER MOBILE */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e3e8ef] bg-white text-[#304563] hover:bg-[#f7f9fb] lg:hidden"
            aria-label="Buka menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* ================= OVERLAY MOBILE ================= */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed left-0 top-0 z-[120] flex h-screen w-[278px] flex-col border-r border-[#e3e8ef] bg-white transition-transform duration-300 lg:top-[88px] lg:h-[calc(100vh-88px)] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ================= MOBILE SIDEBAR HEADER ================= */}
        <div className="flex h-[88px] shrink-0 items-center justify-between border-b border-[#e3e8ef] px-5 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#07966f]">
              <Recycle size={21} className="text-white" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#172b4d]">Bank Sampah</p>

              <p className="text-xs text-[#718198]">Bersih Mandiri</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#718198] hover:bg-[#f7f9fb]"
            aria-label="Tutup menu"
          >
            <X size={21} />
          </button>
        </div>

        {/* ================= MENU ================= */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-[#9aa7b8]">
            Menu Utama
          </p>

          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/nasabah/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition ${
                    active
                      ? "bg-[#e9fbf4] font-semibold text-[#008563]"
                      : "text-[#304563] hover:bg-[#f5f7f9]"
                  }`}
                >
                  <Icon size={20} className="shrink-0" />

                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ================= HELP ================= */}
        <div className="px-4 pb-3">
          <div className="rounded-xl bg-[#075c47] p-4">
            <p className="text-sm font-semibold text-white">Butuh Bantuan?</p>

            <p className="mt-1 text-xs leading-relaxed text-green-100">
              Kelola sampah dan dapatkan manfaatnya.
            </p>
          </div>
        </div>

        {/* ================= LOGOUT ================= */}
        <div className="border-t border-[#e3e8ef] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
          >
            <LogOut size={20} />

            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
