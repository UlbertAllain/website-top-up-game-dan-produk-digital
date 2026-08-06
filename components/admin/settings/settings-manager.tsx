"use client";

import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  SiteSettings,
  SiteSettingsInput,
} from "@/features/settings/settings.types";

type SettingsManagerProps = {
  initialSettings: SiteSettings;
};

type SettingsFormState = Omit<SiteSettingsInput, "seoKeywords"> & {
  seoKeywords: string;
};

type ApiResponse<T> = {
  success: boolean;

  data?: T;

  error?: {
    code?: string;
    message?: string;

    fields?: Record<string, string[]>;
  };
};

const inputClassName = [
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5",
  "text-sm text-neutral-900 outline-none transition",
  "placeholder:text-neutral-400",
  "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
  "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500",
].join(" ");

const textareaClassName = [
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3",
  "text-sm leading-6 text-neutral-900 outline-none transition",
  "placeholder:text-neutral-400",
  "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
  "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500",
].join(" ");

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02] sm:p-6">
      <div className="border-b border-neutral-100 pb-5">
        <h2 className="font-semibold text-neutral-950">{title}</h2>

        <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  required = false,
  description,
  children,
}: {
  label: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-neutral-800">
        {label}

        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </p>

      {description ? (
        <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
      ) : null}

      <div className="mt-2">{children}</div>
    </div>
  );
}

function createFormState(settings: SiteSettings): SettingsFormState {
  return {
    businessName: settings.businessName,

    businessTagline: settings.businessTagline,

    businessDescription: settings.businessDescription,

    whatsappNumber: settings.whatsappNumber,

    whatsappMessageTemplate: settings.whatsappMessageTemplate,

    email: settings.email,
    address: settings.address,

    operatingHours: settings.operatingHours,

    instagramUrl: settings.instagramUrl,

    tiktokUrl: settings.tiktokUrl,

    facebookUrl: settings.facebookUrl,

    youtubeUrl: settings.youtubeUrl,

    seoTitle: settings.seoTitle,

    seoDescription: settings.seoDescription,

    seoKeywords: settings.seoKeywords.join(", "),
  };
}

function parseKeywords(value: string): string[] {
  const uniqueKeywords = new Map<string, string>();

  for (const rawKeyword of value.split(",")) {
    const keyword = rawKeyword.trim().replace(/\s+/g, " ");

    if (!keyword) {
      continue;
    }

    uniqueKeywords.set(keyword.toLocaleLowerCase("id-ID"), keyword);
  }

  return Array.from(uniqueKeywords.values());
}

function normalizeWhatsappNumber(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("8")) {
    return `62${digits}`;
  }

  return digits;
}

function isValidUrl(value: string): boolean {
  if (!value.trim()) {
    return true;
  }

  try {
    const url = new URL(value.trim());

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getApiErrorMessage(
  response: ApiResponse<unknown>,
  fallback: string,
): string {
  if (response.error?.message) {
    return response.error.message;
  }

  if (response.error?.fields) {
    const firstError = Object.values(response.error.fields).flat()[0];

    if (firstError) {
      return firstError;
    }
  }

  return fallback;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function replaceWhatsAppTokens(template: string): string {
  return template
    .replaceAll("{productName}", "Mobile Legends 86 Diamonds")
    .replaceAll("{productCode}", "TP-0001")
    .replaceAll("{productPrice}", "Rp20.000");
}

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const router = useRouter();

  const [savedSettings, setSavedSettings] = useState(initialSettings);

  const [form, setForm] = useState<SettingsFormState>(() =>
    createFormState(initialSettings),
  );

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPayload = useMemo<SiteSettingsInput>(
    () => ({
      businessName: form.businessName.trim(),

      businessTagline: form.businessTagline.trim(),

      businessDescription: form.businessDescription.trim(),

      whatsappNumber: form.whatsappNumber.trim(),

      whatsappMessageTemplate: form.whatsappMessageTemplate.trim(),

      email: form.email.trim(),
      address: form.address.trim(),

      operatingHours: form.operatingHours.trim(),

      instagramUrl: form.instagramUrl.trim(),

      tiktokUrl: form.tiktokUrl.trim(),

      facebookUrl: form.facebookUrl.trim(),

      youtubeUrl: form.youtubeUrl.trim(),

      seoTitle: form.seoTitle.trim(),

      seoDescription: form.seoDescription.trim(),

      seoKeywords: parseKeywords(form.seoKeywords),
    }),
    [form],
  );

  const isDirty =
    JSON.stringify(currentPayload) !==
    JSON.stringify({
      businessName: savedSettings.businessName,

      businessTagline: savedSettings.businessTagline,

      businessDescription: savedSettings.businessDescription,

      whatsappNumber: savedSettings.whatsappNumber,

      whatsappMessageTemplate: savedSettings.whatsappMessageTemplate,

      email: savedSettings.email,

      address: savedSettings.address,

      operatingHours: savedSettings.operatingHours,

      instagramUrl: savedSettings.instagramUrl,

      tiktokUrl: savedSettings.tiktokUrl,

      facebookUrl: savedSettings.facebookUrl,

      youtubeUrl: savedSettings.youtubeUrl,

      seoTitle: savedSettings.seoTitle,

      seoDescription: savedSettings.seoDescription,

      seoKeywords: savedSettings.seoKeywords,
    });

  const normalizedWhatsapp = normalizeWhatsappNumber(form.whatsappNumber);

  const whatsappPreviewMessage = replaceWhatsAppTokens(
    form.whatsappMessageTemplate,
  );

  const whatsappPreviewUrl = normalizedWhatsapp
    ? `https://wa.me/${normalizedWhatsapp}?text=${encodeURIComponent(
        whatsappPreviewMessage,
      )}`
    : "";

  const contactFieldsCompleted = [
    normalizedWhatsapp,
    form.email.trim(),
    form.address.trim(),
    form.operatingHours.trim(),
  ].filter(Boolean).length;

  const socialFieldsCompleted = [
    form.instagramUrl,
    form.tiktokUrl,
    form.facebookUrl,
    form.youtubeUrl,
  ].filter((value) => Boolean(value.trim())).length;

  const seoReady =
    form.seoTitle.trim().length >= 3 && form.seoDescription.trim().length >= 20;

  const completionItems = [
    form.businessName.trim(),
    form.businessTagline.trim(),
    form.businessDescription.trim(),
    normalizedWhatsapp,
    form.whatsappMessageTemplate.trim(),
    form.operatingHours.trim(),
    form.seoTitle.trim(),
    form.seoDescription.trim(),
  ];

  const completionPercentage = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100,
  );

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  function updateField<Key extends keyof SettingsFormState>(
    key: Key,
    value: SettingsFormState[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));

    setNotice("");
  }

  function validateForm(): string | null {
    if (form.businessName.trim().length < 2) {
      return "Nama bisnis minimal 2 karakter.";
    }

    if (form.businessTagline.trim().length > 160) {
      return "Tagline maksimal 160 karakter.";
    }

    if (form.businessDescription.trim().length > 2000) {
      return "Deskripsi bisnis maksimal 2000 karakter.";
    }

    if (
      normalizedWhatsapp &&
      (normalizedWhatsapp.length < 10 || normalizedWhatsapp.length > 16)
    ) {
      return "Nomor WhatsApp harus terdiri dari 10 sampai 16 angka.";
    }

    if (normalizedWhatsapp && form.whatsappMessageTemplate.trim().length < 10) {
      return "Template WhatsApp minimal 10 karakter.";
    }

    const socialUrls = [
      form.instagramUrl,
      form.tiktokUrl,
      form.facebookUrl,
      form.youtubeUrl,
    ];

    if (socialUrls.some((url) => !isValidUrl(url))) {
      return "Alamat media sosial harus berupa URL lengkap.";
    }

    if (form.seoTitle.trim().length < 3 || form.seoTitle.trim().length > 70) {
      return "Judul SEO harus terdiri dari 3 sampai 70 karakter.";
    }

    if (
      form.seoDescription.trim().length < 20 ||
      form.seoDescription.trim().length > 180
    ) {
      return "Deskripsi SEO harus terdiri dari 20 sampai 180 karakter.";
    }

    if (currentPayload.seoKeywords.length > 20) {
      return "Keyword SEO maksimal 20.";
    }

    return null;
  }

  function resetForm() {
    setForm(createFormState(savedSettings));

    setError("");
    setNotice("Perubahan yang belum disimpan telah dibatalkan.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !isDirty) {
      return;
    }

    setError("");
    setNotice("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(currentPayload),

        credentials: "same-origin",

        cache: "no-store",
      });

      const result = (await response.json()) as ApiResponse<{
        settings: SiteSettings;
      }>;

      if (!response.ok || !result.success || !result.data?.settings) {
        throw new Error(
          getApiErrorMessage(result, "Pengaturan gagal disimpan."),
        );
      }

      const updatedSettings = result.data.settings;

      setSavedSettings(updatedSettings);

      setForm(createFormState(updatedSettings));

      setNotice("Pengaturan website berhasil disimpan.");

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Pengaturan gagal disimpan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">
            Kelengkapan Profil
          </p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-blue-700">
            {completionPercentage}%
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-[width]"
              style={{
                width: `${completionPercentage}%`,
              }}
            />
          </div>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">
            Informasi Kontak
          </p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950">
            {contactFieldsCompleted}/4
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            WhatsApp, email, alamat, dan jam operasional.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Media Sosial</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950">
            {socialFieldsCompleted}/4
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Tautan media sosial yang telah diisi.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Status SEO</p>

          <p
            className={[
              "mt-4 text-2xl font-semibold tracking-tight",
              seoReady ? "text-emerald-700" : "text-amber-700",
            ].join(" ")}
          >
            {seoReady ? "Siap" : "Perlu dilengkapi"}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Judul dan deskripsi untuk mesin pencari.
          </p>
        </article>
      </section>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {error}
        </div>
      ) : null}

      {notice ? (
        <div
          role="status"
          className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="shrink-0 font-semibold text-emerald-800"
          >
            Tutup
          </button>
        </div>
      ) : null}

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SettingsSection
            title="Identitas Bisnis"
            description="Informasi utama yang digunakan pada navbar, halaman depan, footer, dan halaman informasi."
          >
            <div className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nama bisnis" required>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(event) =>
                      updateField("businessName", event.target.value)
                    }
                    placeholder="Nama bisnis"
                    maxLength={100}
                    className={inputClassName}
                  />
                </Field>

                <Field
                  label="Tagline"
                  description="Kalimat pendek yang menjelaskan nilai utama bisnis."
                >
                  <input
                    type="text"
                    value={form.businessTagline}
                    onChange={(event) =>
                      updateField("businessTagline", event.target.value)
                    }
                    placeholder="Kebutuhan digital lebih mudah ditemukan."
                    maxLength={160}
                    className={inputClassName}
                  />
                </Field>
              </div>

              <Field
                label="Deskripsi bisnis"
                description="Digunakan sebagai pengenalan singkat pada website."
              >
                <textarea
                  value={form.businessDescription}
                  onChange={(event) =>
                    updateField("businessDescription", event.target.value)
                  }
                  placeholder="Jelaskan produk dan layanan yang disediakan."
                  rows={5}
                  maxLength={2000}
                  className={textareaClassName}
                />

                <div className="mt-2 text-right text-xs text-neutral-400">
                  {form.businessDescription.length}
                  /2000
                </div>
              </Field>
            </div>
          </SettingsSection>

          <SettingsSection
            title="WhatsApp dan Kontak"
            description="Informasi yang digunakan pelanggan untuk bertanya dan melanjutkan proses pemesanan."
          >
            <div className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Nomor WhatsApp"
                  description="Boleh menggunakan format 0812 atau 62812."
                >
                  <input
                    type="text"
                    inputMode="tel"
                    value={form.whatsappNumber}
                    onChange={(event) =>
                      updateField("whatsappNumber", event.target.value)
                    }
                    placeholder="081234567890"
                    maxLength={25}
                    className={inputClassName}
                  />

                  {normalizedWhatsapp ? (
                    <p className="mt-2 text-xs text-neutral-500">
                      Akan disimpan sebagai{" "}
                      <strong className="font-semibold text-neutral-700">
                        +{normalizedWhatsapp}
                      </strong>
                    </p>
                  ) : null}
                </Field>

                <Field label="Email bisnis">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="admin@bisnis.com"
                    maxLength={160}
                    className={inputClassName}
                  />
                </Field>
              </div>

              <Field
                label="Template pesan WhatsApp"
                description="Gunakan token agar pesan otomatis mengikuti produk yang dipilih."
              >
                <textarea
                  value={form.whatsappMessageTemplate}
                  onChange={(event) =>
                    updateField("whatsappMessageTemplate", event.target.value)
                  }
                  placeholder="Halo Admin, saya tertarik dengan {productName}..."
                  rows={5}
                  maxLength={1500}
                  className={textareaClassName}
                />

                <div className="mt-3 rounded-xl bg-neutral-50 p-4">
                  <p className="text-xs font-semibold text-neutral-700">
                    Token yang tersedia
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {["{productName}", "{productCode}", "{productPrice}"].map(
                      (token) => (
                        <button
                          key={token}
                          type="button"
                          onClick={() =>
                            updateField(
                              "whatsappMessageTemplate",
                              `${form.whatsappMessageTemplate}${form.whatsappMessageTemplate ? " " : ""}${token}`,
                            )
                          }
                          className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 font-mono text-xs text-neutral-700 transition hover:border-blue-200 hover:text-blue-700"
                        >
                          {token}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </Field>

              <Field label="Alamat">
                <textarea
                  value={form.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  placeholder="Alamat atau wilayah operasional bisnis."
                  rows={3}
                  maxLength={1000}
                  className={textareaClassName}
                />
              </Field>

              <Field
                label="Jam operasional"
                description="Boleh menggunakan beberapa baris untuk jadwal berbeda."
              >
                <textarea
                  value={form.operatingHours}
                  onChange={(event) =>
                    updateField("operatingHours", event.target.value)
                  }
                  placeholder="Senin–Minggu, 09.00–22.00 WIB"
                  rows={3}
                  maxLength={500}
                  className={textareaClassName}
                />
              </Field>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Media Sosial"
            description="Masukkan URL lengkap. Kolom yang kosong tidak perlu ditampilkan pada website."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Instagram">
                <input
                  type="url"
                  value={form.instagramUrl}
                  onChange={(event) =>
                    updateField("instagramUrl", event.target.value)
                  }
                  placeholder="https://instagram.com/..."
                  className={inputClassName}
                />
              </Field>

              <Field label="TikTok">
                <input
                  type="url"
                  value={form.tiktokUrl}
                  onChange={(event) =>
                    updateField("tiktokUrl", event.target.value)
                  }
                  placeholder="https://tiktok.com/@..."
                  className={inputClassName}
                />
              </Field>

              <Field label="Facebook">
                <input
                  type="url"
                  value={form.facebookUrl}
                  onChange={(event) =>
                    updateField("facebookUrl", event.target.value)
                  }
                  placeholder="https://facebook.com/..."
                  className={inputClassName}
                />
              </Field>

              <Field label="YouTube">
                <input
                  type="url"
                  value={form.youtubeUrl}
                  onChange={(event) =>
                    updateField("youtubeUrl", event.target.value)
                  }
                  placeholder="https://youtube.com/@..."
                  className={inputClassName}
                />
              </Field>
            </div>
          </SettingsSection>

          <SettingsSection
            title="SEO Website"
            description="Informasi utama yang digunakan pada judul tab browser dan hasil pencarian."
          >
            <div className="grid gap-5">
              <Field
                label="Judul SEO"
                required
                description="Idealnya tidak lebih dari 60 karakter."
              >
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(event) =>
                    updateField("seoTitle", event.target.value)
                  }
                  placeholder="Nama bisnis dan layanan utama"
                  maxLength={70}
                  className={inputClassName}
                />

                <div className="mt-2 text-right text-xs text-neutral-400">
                  {form.seoTitle.length}
                  /70
                </div>
              </Field>

              <Field
                label="Deskripsi SEO"
                required
                description="Jelaskan layanan dalam kalimat yang natural."
              >
                <textarea
                  value={form.seoDescription}
                  onChange={(event) =>
                    updateField("seoDescription", event.target.value)
                  }
                  placeholder="Temukan produk digital..."
                  rows={4}
                  maxLength={180}
                  className={textareaClassName}
                />

                <div className="mt-2 text-right text-xs text-neutral-400">
                  {form.seoDescription.length}
                  /180
                </div>
              </Field>

              <Field
                label="Keyword SEO"
                description="Pisahkan setiap keyword menggunakan koma."
              >
                <textarea
                  value={form.seoKeywords}
                  onChange={(event) =>
                    updateField("seoKeywords", event.target.value)
                  }
                  placeholder="produk digital, top up game, aplikasi premium"
                  rows={3}
                  className={textareaClassName}
                />

                <p className="mt-2 text-xs text-neutral-500">
                  {currentPayload.seoKeywords.length} dari maksimal 20 keyword.
                </p>
              </Field>
            </div>
          </SettingsSection>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Preview Identitas
            </p>

            <div className="mt-4 rounded-2xl bg-neutral-950 p-5 text-white">
              <div className="flex size-11 items-center justify-center rounded-xl bg-white text-sm font-semibold text-neutral-950">
                {form.businessName
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((word) => word.charAt(0).toUpperCase())
                  .join("") || "DS"}
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                {form.businessName.trim() || "Nama Bisnis"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/65">
                {form.businessTagline.trim() ||
                  "Tagline bisnis akan tampil di bagian ini."}
              </p>

              {normalizedWhatsapp ? (
                <a
                  href={whatsappPreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
                >
                  Preview WhatsApp
                </a>
              ) : (
                <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-xs text-white/60">
                  Isi nomor WhatsApp untuk mengaktifkan tombol pemesanan.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Preview Mesin Pencari
            </p>

            <div className="mt-4 rounded-xl border border-neutral-200 p-4">
              <p className="truncate text-sm text-emerald-700">
                website-bisnis.com
              </p>

              <p className="mt-1 line-clamp-2 text-lg font-medium leading-6 text-blue-700">
                {form.seoTitle.trim() || "Judul website"}
              </p>

              <p className="mt-1 line-clamp-3 text-sm leading-6 text-neutral-600">
                {form.seoDescription.trim() ||
                  "Deskripsi website akan tampil di bagian ini."}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Penyimpanan
            </p>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3.5 py-3">
              <span className="text-xs text-neutral-500">Status perubahan</span>

              <span
                className={[
                  "text-xs font-semibold",
                  isDirty ? "text-amber-700" : "text-emerald-700",
                ].join(" ")}
              >
                {isDirty ? "Belum disimpan" : "Tersimpan"}
              </span>
            </div>

            <p className="mt-4 text-xs leading-5 text-neutral-500">
              Terakhir disimpan {formatDate(savedSettings.updatedAt)}
            </p>

            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Menyimpan..."
                : isDirty
                  ? "Simpan Pengaturan"
                  : "Sudah Tersimpan"}
            </button>

            <button
              type="button"
              disabled={isSubmitting || !isDirty}
              onClick={resetForm}
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batalkan Perubahan
            </button>
          </section>
        </aside>
      </div>

      {isDirty ? (
        <div className="fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-amber-200 bg-white p-3 shadow-2xl shadow-neutral-950/15 sm:left-auto sm:right-6 sm:w-[380px]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              !
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900">
                Perubahan belum disimpan
              </p>

              <p className="mt-0.5 text-xs text-neutral-500">
                Simpan agar perubahan tampil pada website.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="shrink-0 rounded-xl bg-neutral-950 px-3.5 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
