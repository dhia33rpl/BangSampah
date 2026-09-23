"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Recycle,
  ArrowRight,
  Leaf,
  Gift,
  X,
  UserRound,
  ShieldCheck,
} from "lucide-react";

export default function LandingPage() {
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  return (
    <main className="min-h-screen bg-[#f7f9fb] text-[#172b4d]">
      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <header className="border-b border-[#e5e9ef] bg-white">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#07966f] text-white">
              <Recycle size={22} />
            </div>

            <div>
              <h1 className="text-[17px] font-bold leading-tight">
                Bank Sampah Bersih Mandiri
              </h1>

              <p className="text-xs text-[#718198]">
                Kelola Sampah, Dapatkan Manfaat
              </p>
            </div>
          </Link>

          {/* NAVBAR BUTTON */}
          <div className="flex items-center gap-2">
            {/* LOGIN */}
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-[#07966f] transition hover:bg-[#effcf7]"
            >
              Masuk
            </Link>

            {/* REGISTER POPUP */}
            <button
              type="button"
              onClick={() => setShowRegisterPopup(true)}
              className="rounded-lg bg-[#07966f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#078a68]"
            >
              Daftar
            </button>
          </div>
        </div>
      </header>

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* HERO TEXT */}
          <div>
            {/* BADGE */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e9fbf4] px-3 py-1.5 text-xs font-semibold text-[#078563]">
              <Leaf size={14} />
              Peduli Lingkungan
            </div>

            {/* TITLE */}
            <h2 className="mt-5 text-[38px] font-bold leading-tight sm:text-[48px]">
              Sampahmu Bisa
              <span className="text-[#07966f]"> Jadi Berharga.</span>
            </h2>

            {/* DESCRIPTION */}
            <p className="mt-4 max-w-[520px] text-[15px] leading-7 text-[#718198] sm:text-base">
              Setorkan sampahmu, dapatkan poin, dan tukarkan dengan berbagai
              hadiah menarik. Bersama kita wujudkan lingkungan yang lebih
              bersih.
            </p>

            {/* HERO BUTTON */}
            <div className="mt-7 flex gap-3">
              {/* MULAI SEKARANG */}
              <button
                type="button"
                onClick={() => setShowRegisterPopup(true)}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#07966f]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#078a68]
                "
              >
                Mulai Sekarang
                <ArrowRight size={17} />
              </button>

              {/* LOGIN */}
              <Link
                href="/login"
                className="
                  rounded-xl
                  border
                  border-[#dce3eb]
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-[#304563]
                  transition
                  hover:bg-[#f5f7f9]
                "
              >
                Masuk
              </Link>
            </div>
          </div>

          {/* ================================================= */}
          {/* CARD KANAN */}
          {/* ================================================= */}

          <div className="relative">
            <div className="rounded-[28px] bg-[#07966f] p-7 text-white sm:p-9">
              {/* CARD HEADER */}
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <Recycle size={27} />
                </div>

                <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs">
                  Bersih & Berkelanjutan
                </div>
              </div>

              {/* CARD TITLE */}
              <h3 className="mt-10 text-2xl font-bold">
                Satu langkah kecil,
                <br />
                berdampak besar 🌱
              </h3>

              {/* CARD DESCRIPTION */}
              <p className="mt-3 text-sm leading-6 text-[#d9fff4]">
                Pilah sampah dari rumah dan ubah menjadi sesuatu yang lebih
                bermanfaat.
              </p>

              {/* MINI INFO */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                {/* SETOR */}
                <div className="rounded-xl bg-white/10 p-4">
                  <Recycle size={19} />

                  <p className="mt-3 text-xs text-[#d9fff4]">Setorkan Sampah</p>

                  <p className="mt-1 font-bold">Dapat Poin</p>
                </div>

                {/* HADIAH */}
                <div className="rounded-xl bg-white/10 p-4">
                  <Gift size={19} />

                  <p className="mt-3 text-xs text-[#d9fff4]">Tukarkan</p>

                  <p className="mt-1 font-bold">Dapat Hadiah</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* 3 FITUR SINGKAT */}
      {/* ================================================= */}

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          <Feature
            icon={<Recycle size={21} />}
            title="Setor Sampah"
            text="Ajukan penyetoran sampah dengan mudah."
          />

          <Feature
            icon={<Leaf size={21} />}
            title="Dapatkan Poin"
            text="Setiap sampah memiliki nilai poin."
          />

          <Feature
            icon={<Gift size={21} />}
            title="Tukar Hadiah"
            text="Gunakan poin untuk mendapatkan hadiah."
          />
        </div>
      </section>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="border-t border-[#e3e8ef] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 sm:flex-row">
          <p className="text-sm font-semibold text-[#304563]">
            Bank Sampah Bersih Mandiri
          </p>

          <p className="text-xs text-[#91a0b3]">© 2026 Bersih Mandiri</p>
        </div>
      </footer>

      {/* ================================================= */}
      {/* POPUP PILIH JENIS PENDAFTARAN */}
      {/* ================================================= */}

      {showRegisterPopup && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            px-5
            backdrop-blur-[2px]
          "
          onClick={() => setShowRegisterPopup(false)}
        >
          {/* POPUP CARD */}
          <div
            className="
              relative
              w-full
              max-w-[440px]
              rounded-3xl
              bg-white
              p-6
              shadow-2xl
              sm:p-7
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* ================================================= */}
            {/* CLOSE BUTTON */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={() => setShowRegisterPopup(false)}
              className="
                absolute
                right-4
                top-4
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-[#718198]
                transition
                hover:bg-[#f1f5f3]
                hover:text-[#07966f]
              "
            >
              <X size={20} />
            </button>

            {/* ================================================= */}
            {/* POPUP HEADER */}
            {/* ================================================= */}

            <div className="pr-8">
              {/* ICON */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9fbf4] text-[#07966f]">
                <Recycle size={25} />
              </div>

              {/* TITLE */}
              <h2 className="text-2xl font-bold text-[#172b4d]">
                Pilih Jenis Pendaftaran
              </h2>

              {/* DESCRIPTION */}
              <p className="mt-2 text-sm leading-6 text-[#718198]">
                Silakan pilih peran akun yang ingin kamu daftarkan.
              </p>
            </div>

            {/* ================================================= */}
            {/* PILIHAN PENDAFTARAN */}
            {/* ================================================= */}

            <div className="mt-6 space-y-3">
              {/* ================================================= */}
              {/* NASABAH */}
              {/* ================================================= */}

              <Link
                href="/register"
                onClick={() => setShowRegisterPopup(false)}
                className="
                  group
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-[#dce8e3]
                  bg-[#f8fffc]
                  p-4
                  transition
                  hover:border-[#07966f]
                  hover:bg-[#effcf7]
                "
              >
                {/* ICON */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e0f8ef] text-[#07966f]">
                  <UserRound size={23} />
                </div>

                {/* TEXT */}
                <div className="flex-1">
                  <h3 className="font-bold text-[#172b4d]">
                    Daftar Akun Nasabah
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#718198]">
                    Untuk penyetor sampah
                  </p>
                </div>

                {/* ARROW */}
                <ArrowRight
                  size={19}
                  className="
                    text-[#9aabba]
                    transition
                    group-hover:translate-x-1
                    group-hover:text-[#07966f]
                  "
                />
              </Link>

              {/* ================================================= */}
              {/* ADMIN */}
              {/* ================================================= */}

              <Link
                href="/register/admin"
                onClick={() => setShowRegisterPopup(false)}
                className="
                  group
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-[#dce8e3]
                  bg-[#f8fffc]
                  p-4
                  transition
                  hover:border-[#07966f]
                  hover:bg-[#effcf7]
                "
              >
                {/* ICON */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#3d72d9]">
                  <ShieldCheck size={23} />
                </div>

                {/* TEXT */}
                <div className="flex-1">
                  <h3 className="font-bold text-[#172b4d]">
                    Daftar Unit Admin
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#718198]">
                    Untuk pengelola instansi
                  </p>
                </div>

                {/* ARROW */}
                <ArrowRight
                  size={19}
                  className="
                    text-[#9aabba]
                    transition
                    group-hover:translate-x-1
                    group-hover:text-[#07966f]
                  "
                />
              </Link>
            </div>

            {/* ================================================= */}
            {/* BATAL */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={() => setShowRegisterPopup(false)}
              className="
                mt-5
                w-full
                rounded-xl
                border
                border-[#dce3eb]
                bg-white
                py-3
                text-sm
                font-semibold
                text-[#718198]
                transition
                hover:bg-[#f5f7f9]
              "
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* ================================================= */
/* COMPONENT FEATURE */
/* ================================================= */

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#e0e7ef] bg-white p-5 transition hover:shadow-sm">
      {/* ICON */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9fbf4] text-[#07966f]">
        {icon}
      </div>

      {/* TEXT */}
      <div>
        <h3 className="text-sm font-bold">{title}</h3>

        <p className="mt-1 text-xs leading-5 text-[#718198]">{text}</p>
      </div>
    </div>
  );
}
