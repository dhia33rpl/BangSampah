"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  History,
  Tags,
  Gift,
  User,
  LogOut,
  Menu,
  X,
  Recycle,
  ArrowRightLeft,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Data Nasabah",
    href: "/admin/listNasabah",
    icon: Users,
  },
  {
    label: "Setoran Sampah",
    href: "/admin/setoran",
    icon: History,
  },
  {
    label: "Kategori Sampah",
    href: "/admin/kategori",
    icon: Tags,
  },
  {
    label: "Katalog Hadiah",
    href: "/admin/hadiah",
    icon: Gift,
  },
  {
    label: "Penukaran Poin",
    href: "/admin/penukaran",
    icon: ArrowRightLeft,
  },
  {
    label: "Profile",
    href: "/admin/profile",
    icon: User,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* MOBILE HEADER */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-[72px] items-center justify-between border-b border-[#e3e8ef] bg-white px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#172b4d] transition hover:bg-[#f7f9fb]"
            aria-label="Buka menu"
          >
            <Menu size={23} />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9fbf4] text-[#07966f]">
              <Recycle size={20} />
            </div>

            <div>
              <p className="text-sm font-bold leading-tight text-[#172b4d]">
                Bank Sampah
              </p>

              <p className="text-[11px] leading-tight text-[#07966f]">
                Bersih Mandiri
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          title="Keluar"
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#718198] transition hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[278px] flex-col border-r border-[#e3e8ef] bg-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex h-[88px] shrink-0 items-center justify-between border-b border-[#e3e8ef] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9fbf4] text-[#07966f]">
              <Recycle size={24} />
            </div>

            <div>
              <p className="text-[15px] font-bold leading-tight text-[#172b4d]">
                Bank Sampah
              </p>

              <p className="text-[13px] font-medium leading-tight text-[#07966f]">
                Bersih Mandiri
              </p>

              <p className="mt-1 text-[11px] text-[#718198]">Dashboard Admin</p>
            </div>
          </div>

          {/* CLOSE MOBILE */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#718198] transition hover:bg-[#f7f9fb] lg:hidden"
            aria-label="Tutup menu"
          >
            <X size={21} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#a0aaba]">
            Menu Utama
          </p>

          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#e9fbf4] text-[#008563]"
                      : "text-[#718198] hover:bg-[#f7f9fb] hover:text-[#172b4d]"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.3 : 2} />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="shrink-0 border-t border-[#e3e8ef] p-4">
          <div className="rounded-xl bg-[#075c47] px-4 py-3">
            <p className="text-xs font-semibold text-white">
              Bank Sampah Bersih Mandiri
            </p>

            <p className="mt-1 text-[11px] leading-relaxed text-green-100">
              Kelola data bank sampah dengan mudah dan terorganisir.
            </p>
          </div>
        </div>
      </aside>

      {/* DESKTOP HEADER */}
      <header className="fixed left-[278px] right-0 top-0 z-30 hidden h-[88px] items-center justify-between border-b border-[#e3e8ef] bg-white px-8 lg:flex">
        <div>
          <p className="text-sm font-semibold text-[#172b4d]">
            Dashboard Admin
          </p>

          <p className="mt-0.5 text-xs text-[#718198]">
            Kelola Bank Sampah Bersih Mandiri
          </p>
        </div>

        {/* LOGOUT ONLY */}
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            title="Keluar"
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#718198] transition hover:bg-red-50 hover:text-red-500"
          >
            <LogOut size={21} />
          </button>
        </div>
      </header>
    </>
  );
}
