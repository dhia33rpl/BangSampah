"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Phone,
  MapPin,
  Camera,
} from "lucide-react";

type NasabahData = {
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
  data: NasabahData;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

export default function EditNasabahPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [namaLengkap, setNamaLengkap] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [alamat, setAlamat] = useState("");

  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // URL FOTO
  // =====================================================

  const getFotoUrl = (fotoPath?: string) => {
    if (!fotoPath) return "";

    if (fotoPath.startsWith("http")) {
      return fotoPath;
    }

    const serverUrl = BASE_URL.replace(/\/api\/v1\/?$/, "");

    const path = fotoPath.startsWith("/") ? fotoPath : `/${fotoPath}`;

    return `${serverUrl}${path}`;
  };

  // =====================================================
  // GET DATA NASABAH
  // =====================================================

  useEffect(() => {
    if (!id) return;

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

        /*
         * GET DETAIL
         *
         * ?_=${Date.now()}
         * digunakan supaya browser tidak mengambil
         * response lama.
         */

        const response = await fetch(
          `${BASE_URL}/admin/nasabah/${id}?_=${Date.now()}`,
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

        console.log("GET DETAIL NASABAH:", result);

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil data nasabah.");
        }

        const data = result.data;

        // =================================================
        // ISI FORM DARI DATA BE
        // =================================================

        setNamaLengkap(data.namaNasabah || "");

        setNoTelepon(data.telp || "");

        setAlamat(data.alamat || "");

        // =================================================
        // FOTO LAMA
        // =================================================

        if (data.foto) {
          setPreviewFoto(`${getFotoUrl(data.foto)}?v=${Date.now()}`);
        }
      } catch (err) {
        console.error("GET NASABAH ERROR:", err);

        setError(
          err instanceof Error ? err.message : "Gagal mengambil data nasabah.",
        );
      } finally {
        setLoading(false);
      }
    };

    getNasabah();
  }, [id, router]);

  // =====================================================
  // PILIH FOTO
  // =====================================================

  const handleFotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      setError("Foto harus berformat JPG, JPEG, atau PNG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }

    setError("");
    setFoto(file);

    const objectUrl = URL.createObjectURL(file);

    setPreviewFoto(objectUrl);
  };

  // =====================================================
  // SUBMIT UPDATE
  // =====================================================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
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

      // =================================================
      // VALIDASI
      // =================================================

      if (!namaLengkap.trim()) {
        throw new Error("Nama lengkap wajib diisi.");
      }

      if (!noTelepon.trim()) {
        throw new Error("Nomor telepon wajib diisi.");
      }

      if (!alamat.trim()) {
        throw new Error("Alamat wajib diisi.");
      }

      // =================================================
      // FORMDATA
      // =================================================

      const formData = new FormData();

      /*
       * INI PERSIS FIELD DARI SWAGGER:
       *
       * namaLengkap
       * noTelepon
       * alamat
       * foto
       *
       * TIDAK ADA tanggalLahir
       */

      formData.append("namaLengkap", namaLengkap.trim());

      formData.append("noTelepon", noTelepon.trim());

      formData.append("alamat", alamat.trim());

      if (foto) {
        formData.append("foto", foto);
      }

      // =================================================
      // DEBUG
      // =================================================

      console.log("==============================");

      console.log("UPDATE NASABAH");

      console.log("==============================");

      console.log("URL:", `${BASE_URL}/admin/nasabah/${id}`);

      formData.forEach((value, key) => {
        console.log(key, value instanceof File ? value.name : value);
      });

      // =================================================
      // PUT
      // =================================================

      const response = await fetch(`${BASE_URL}/admin/nasabah/${id}`, {
        method: "PUT",

        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,
          Authorization: `Bearer ${token}`,
        },

        /*
         * JANGAN kasih Content-Type manual.
         * Browser otomatis membuat:
         * multipart/form-data + boundary
         */

        body: formData,
      });

      const result: ApiResponse = await response.json();

      console.log("PUT RESPONSE:", result);

      // =================================================
      // CEK HASIL
      // =================================================

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Data nasabah gagal diperbarui.");
      }

      // =================================================
      // BERHASIL
      // =================================================

      console.log("UPDATE BERHASIL:", result.data);

      /*
       * PENTING:
       *
       * Kita pakai window.location.href
       * supaya halaman detail benar-benar
       * dimuat ulang dan GET mengambil
       * data terbaru dari BE.
       */

      window.location.href = `/admin/listNasabah/${id}`;
    } catch (err) {
      console.error("UPDATE NASABAH ERROR:", err);

      setError(
        err instanceof Error ? err.message : "Gagal memperbarui data nasabah.",
      );

      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fb]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            Memuat data nasabah...
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f7f9fb]">
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        {/* =================================================
            KEMBALI
        ================================================= */}

        <button
          type="button"
          onClick={() => router.push(`/admin/listNasabah/${id}`)}
          disabled={saving}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-600 disabled:opacity-50"
        >
          <ArrowLeft size={18} />
          Kembali ke Detail Nasabah
        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
            <User size={24} className="text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800">Edit Nasabah</h1>

          <p className="mt-1 text-sm text-gray-400">
            Perbarui informasi data nasabah
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* =================================================
                FOTO
            ================================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Foto Nasabah
              </label>

              <div className="flex items-center gap-5">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                  {previewFoto ? (
                    <img
                      src={previewFoto}
                      alt="Foto nasabah"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera size={30} className="text-gray-300" />
                  )}
                </div>

                <div>
                  <label
                    htmlFor="foto"
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 ${
                      saving ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <Camera size={17} />
                    Ganti Foto
                  </label>

                  <input
                    id="foto"
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={handleFotoChange}
                    disabled={saving}
                    className="hidden"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    JPG / PNG, maksimal 5 MB
                  </p>

                  {foto && (
                    <p className="mt-1 text-xs font-medium text-green-600">
                      Foto baru: {foto.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                NAMA LENGKAP
            ================================================= */}

            <div>
              <label
                htmlFor="namaLengkap"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Nama Lengkap
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="namaLengkap"
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  disabled={saving}
                  required
                  placeholder="Nama lengkap"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* =================================================
                NOMOR TELEPON
            ================================================= */}

            <div>
              <label
                htmlFor="noTelepon"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Nomor Telepon
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="noTelepon"
                  type="tel"
                  value={noTelepon}
                  onChange={(e) => setNoTelepon(e.target.value)}
                  disabled={saving}
                  required
                  placeholder="Nomor telepon"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* =================================================
                ALAMAT
            ================================================= */}

            <div>
              <label
                htmlFor="alamat"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Alamat
              </label>

              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-4 top-4 text-gray-400"
                />

                <textarea
                  id="alamat"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  disabled={saving}
                  required
                  rows={4}
                  placeholder="Alamat lengkap"
                  className="w-full resize-none rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* =================================================
                BUTTON
            ================================================= */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push(`/admin/listNasabah/${id}`)}
                disabled={saving}
                className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
