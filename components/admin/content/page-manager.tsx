"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import type {
  ContentPage,
  ContentPageSlug,
  ContentStatus,
} from "@/features/content/content.types";

type PageManagerProps = {
  initialPages: ContentPage[];
};

type PageFormState = {
  title: string;
  excerpt: string;
  content: string;
  status: ContentStatus;
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

type PageConfiguration = {
  label: string;
  shortLabel: string;
  description: string;
  contentHint: string;
};

const PAGE_ORDER: ContentPageSlug[] = [
  "about",
  "how-to-order",
  "terms",
  "privacy",
];

const PAGE_CONFIGURATIONS: Record<ContentPageSlug, PageConfiguration> = {
  about: {
    label: "Tentang Kami",
    shortLabel: "Tentang",
    description:
      "Mengenalkan bisnis, layanan, nilai, dan cara pelayanan kepada pengunjung.",

    contentHint:
      "Ceritakan profil bisnis, produk yang disediakan, cara pelayanan, dan hal yang membedakan bisnis ini.",
  },

  "how-to-order": {
    label: "Cara Pemesanan",
    shortLabel: "Pemesanan",
    description:
      "Menjelaskan langkah pelanggan dalam memilih produk dan menghubungi admin.",

    contentHint:
      "Gunakan urutan yang jelas. Contoh: pilih produk, baca detail, hubungi admin, konfirmasi pembayaran, dan tunggu proses.",
  },

  terms: {
    label: "Syarat dan Ketentuan",
    shortLabel: "Ketentuan",
    description:
      "Menjelaskan aturan pemesanan, pembayaran, proses, garansi, dan tanggung jawab pelanggan.",

    contentHint:
      "Tuliskan aturan secara jelas dan tidak menakutkan. Pisahkan setiap ketentuan menggunakan baris baru.",
  },

  privacy: {
    label: "Kebijakan Privasi",
    shortLabel: "Privasi",
    description:
      "Menjelaskan bagaimana informasi pelanggan digunakan dan dilindungi.",

    contentHint:
      "Jelaskan data apa yang digunakan, tujuan penggunaannya, dan komitmen untuk tidak menyalahgunakan data pelanggan.",
  },
};

const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Draft",
  published: "Dipublikasikan",
  hidden: "Disembunyikan",
};

const STATUS_CLASSES: Record<ContentStatus, string> = {
  draft: "bg-amber-50 text-amber-700 ring-amber-600/10",

  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",

  hidden: "bg-neutral-100 text-neutral-600 ring-neutral-500/10",
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
  "text-sm leading-7 text-neutral-900 outline-none transition",
  "placeholder:text-neutral-400",
  "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
  "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500",
].join(" ");

function sortPages(pages: ContentPage[]): ContentPage[] {
  return PAGE_ORDER.map((slug) =>
    pages.find((page) => page.slug === slug),
  ).filter((page): page is ContentPage => Boolean(page));
}

function upsertPage(
  pages: ContentPage[],
  savedPage: ContentPage,
): ContentPage[] {
  const pageExists = pages.some((page) => page.slug === savedPage.slug);

  if (!pageExists) {
    return sortPages([...pages, savedPage]);
  }

  return sortPages(
    pages.map((page) => (page.slug === savedPage.slug ? savedPage : page)),
  );
}

function countWords(value: string): number {
  const normalized = value.trim();

  if (!normalized) {
    return 0;
  }

  return normalized.split(/\s+/).filter(Boolean).length;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Belum pernah disimpan";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getApiErrorMessage(
  response: ApiResponse<unknown>,
  fallback: string,
): string {
  if (response.error?.message) {
    return response.error.message;
  }

  if (response.error?.fields) {
    const firstFieldError = Object.values(response.error.fields).flat()[0];

    if (firstFieldError) {
      return firstFieldError;
    }
  }

  return fallback;
}

function PageIcon({ slug }: { slug: ContentPageSlug }) {
  const commonProps = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    className: "size-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (slug) {
    case "about":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8" r="4" />

          <path d="M5 21a7 7 0 0 1 14 0" />
        </svg>
      );

    case "how-to-order":
      return (
        <svg {...commonProps}>
          <path d="M9 6h11" />
          <path d="M9 12h11" />
          <path d="M9 18h11" />

          <path d="m3 6 1 1 2-2" />
          <path d="m3 12 1 1 2-2" />
          <path d="m3 18 1 1 2-2" />
        </svg>
      );

    case "terms":
      return (
        <svg {...commonProps}>
          <path d="M6 3h9l3 3v15H6V3Z" />
          <path d="M14 3v4h4" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      );

    case "privacy":
      return (
        <svg {...commonProps}>
          <path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z" />

          <path d="M9.5 12 11 13.5l3.5-3.5" />
        </svg>
      );
  }
}

function PagePreviewContent({ content }: { content: string }) {
  const lines = content.split("\n").map((line) => line.trim());

  if (lines.every((line) => !line)) {
    return (
      <p className="text-sm italic leading-7 text-neutral-400">
        Isi halaman akan tampil di bagian ini.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        if (!line) {
          return <div key={`space-${index}`} className="h-1" />;
        }

        const isOrderedLine = /^\d+[.)]\s+/.test(line);

        const isBulletLine = /^[-•]\s+/.test(line);

        if (isOrderedLine || isBulletLine) {
          return (
            <div key={`${line}-${index}`} className="flex items-start gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-neutral-400" />

              <p className="text-sm leading-7 text-neutral-600">{line}</p>
            </div>
          );
        }

        return (
          <p
            key={`${line}-${index}`}
            className="text-sm leading-7 text-neutral-600"
          >
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function PageManager({ initialPages }: PageManagerProps) {
  const router = useRouter();

  const [pages, setPages] = useState<ContentPage[]>(sortPages(initialPages));

  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);

  const [form, setForm] = useState<PageFormState>({
    title: "",
    excerpt: "",
    content: "",
    status: "draft",
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [formError, setFormError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notice, setNotice] = useState("");

  const publishedCount = pages.filter(
    (page) => page.status === "published",
  ).length;

  const draftCount = pages.filter((page) => page.status === "draft").length;

  const hiddenCount = pages.filter((page) => page.status === "hidden").length;

  const contentWordCount = useMemo(
    () => countWords(form.content),
    [form.content],
  );

  const totalPublishedWords = pages
    .filter((page) => page.status === "published")
    .reduce((total, page) => total + countWords(page.content), 0);

  const currentConfiguration = editingPage
    ? PAGE_CONFIGURATIONS[editingPage.slug]
    : null;

  useEffect(() => {
    if (!isEditorOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || isSubmitting) {
        return;
      }

      closeEditor();
    }

    window.addEventListener("keydown", handleEscape);

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);

      document.body.style.overflow = previousOverflow;
    };
  }, [isEditorOpen, isSubmitting]);

  function updateForm<Key extends keyof PageFormState>(
    key: Key,
    value: PageFormState[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function openEditor(page: ContentPage) {
    setEditingPage(page);

    setForm({
      title: page.title,
      excerpt: page.excerpt,
      content: page.content,
      status: page.status,
    });

    setFormError("");
    setNotice("");
    setIsEditorOpen(true);
  }

  function closeEditor() {
    if (isSubmitting) {
      return;
    }

    setIsEditorOpen(false);
    setEditingPage(null);

    setForm({
      title: "",
      excerpt: "",
      content: "",
      status: "draft",
    });

    setFormError("");
  }

  function validateForm(): string | null {
    const title = form.title.trim();

    const excerpt = form.excerpt.trim();

    const content = form.content.trim();

    if (title.length < 3) {
      return "Judul halaman minimal 3 karakter.";
    }

    if (title.length > 120) {
      return "Judul halaman maksimal 120 karakter.";
    }

    if (excerpt.length > 300) {
      return "Ringkasan halaman maksimal 300 karakter.";
    }

    if (content.length < 20) {
      return "Isi halaman minimal 20 karakter.";
    }

    if (content.length > 30000) {
      return "Isi halaman maksimal 30000 karakter.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingPage || isSubmitting) {
      return;
    }

    setFormError("");

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/pages/${editingPage.slug}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          title: form.title.trim(),

          excerpt: form.excerpt.trim(),

          content: form.content.trim(),

          status: form.status,
        }),

        credentials: "same-origin",

        cache: "no-store",
      });

      const result = (await response.json()) as ApiResponse<{
        page: ContentPage;
      }>;

      if (!response.ok || !result.success || !result.data?.page) {
        throw new Error(getApiErrorMessage(result, "Halaman gagal disimpan."));
      }

      const savedPage = result.data.page;

      setPages((currentPages) => upsertPage(currentPages, savedPage));

      setNotice(
        `${PAGE_CONFIGURATIONS[savedPage.slug].label} berhasil disimpan.`,
      );

      router.refresh();
      closeEditor();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Halaman gagal disimpan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Total Halaman</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950">
            {pages.length}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Halaman informasi tetap.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Dipublikasikan</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-emerald-700">
            {publishedCount}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Siap dilihat pengunjung.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Belum Tayang</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-amber-700">
            {draftCount + hiddenCount}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Draft atau disembunyikan.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">
            Kata Terpublikasi
          </p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-blue-700">
            {totalPublishedWords.toLocaleString("id-ID")}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Total isi halaman aktif.
          </p>
        </article>
      </section>

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

      <section className="mt-6">
        <div className="grid gap-5 md:grid-cols-2">
          {pages.map((page) => {
            const configuration = PAGE_CONFIGURATIONS[page.slug];

            const wordCount = countWords(page.content);

            const isContentReady =
              page.title.trim().length >= 3 && page.content.trim().length >= 20;

            return (
              <article
                key={page.slug}
                className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02] transition hover:border-neutral-300 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 transition group-hover:bg-neutral-950 group-hover:text-white">
                      <PageIcon slug={page.slug} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {configuration.shortLabel}
                      </p>

                      <h2 className="mt-1 truncate text-lg font-semibold text-neutral-950">
                        {configuration.label}
                      </h2>
                    </div>
                  </div>

                  <span
                    className={[
                      "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
                      STATUS_CLASSES[page.status],
                    ].join(" ")}
                  >
                    {STATUS_LABELS[page.status]}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-neutral-600">
                  {configuration.description}
                </p>

                <div className="mt-5 rounded-xl bg-neutral-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Judul saat ini
                  </p>

                  <p className="mt-2 line-clamp-1 text-sm font-semibold text-neutral-900">
                    {page.title}
                  </p>

                  <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-neutral-500">
                    {page.excerpt || "Belum memiliki ringkasan halaman."}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-neutral-100 px-3.5 py-3">
                    <p className="text-[11px] text-neutral-500">Jumlah kata</p>

                    <p className="mt-1 text-sm font-semibold text-neutral-900">
                      {wordCount.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-100 px-3.5 py-3">
                    <p className="text-[11px] text-neutral-500">Kelengkapan</p>

                    <p
                      className={[
                        "mt-1 text-sm font-semibold",
                        isContentReady ? "text-emerald-700" : "text-amber-700",
                      ].join(" ")}
                    >
                      {isContentReady ? "Siap" : "Perlu diisi"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-1 flex-col justify-end">
                  <p className="text-xs leading-5 text-neutral-400">
                    Terakhir diperbarui: {formatDate(page.updatedAt)}
                  </p>

                  <button
                    type="button"
                    onClick={() => openEditor(page)}
                    className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Edit Halaman
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {isEditorOpen && editingPage && currentConfiguration ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] overflow-y-auto bg-neutral-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) {
              closeEditor();
            }
          }}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="page-editor-title"
              className="my-4 w-full max-w-6xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-5 sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white">
                    <PageIcon slug={editingPage.slug} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                      Halaman Informasi
                    </p>

                    <h2
                      id="page-editor-title"
                      className="mt-1 truncate text-xl font-semibold tracking-tight text-neutral-950"
                    >
                      Edit {currentConfiguration.label}
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                      /{editingPage.slug}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={isSubmitting}
                  aria-label="Tutup editor"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="m6 6 12 12" />
                    <path d="M18 6 6 18" />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid lg:grid-cols-[minmax(0,1fr)_430px]"
              >
                <div className="p-5 sm:p-6">
                  {formError ? (
                    <div
                      role="alert"
                      className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                    >
                      {formError}
                    </div>
                  ) : null}

                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                    <p className="text-sm font-semibold text-blue-900">
                      Panduan isi
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      {currentConfiguration.contentHint}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-5">
                    <div>
                      <label
                        htmlFor="page-title"
                        className="text-sm font-semibold text-neutral-800"
                      >
                        Judul halaman
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <input
                        id="page-title"
                        type="text"
                        value={form.title}
                        onChange={(event) =>
                          updateForm("title", event.target.value)
                        }
                        placeholder="Masukkan judul halaman"
                        maxLength={120}
                        className={`${inputClassName} mt-2`}
                      />

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-neutral-500">
                          Tampil sebagai judul utama halaman.
                        </p>

                        <span className="shrink-0 text-xs text-neutral-400">
                          {form.title.length}
                          /120
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="page-excerpt"
                        className="text-sm font-semibold text-neutral-800"
                      >
                        Ringkasan
                      </label>

                      <textarea
                        id="page-excerpt"
                        value={form.excerpt}
                        onChange={(event) =>
                          updateForm("excerpt", event.target.value)
                        }
                        placeholder="Tuliskan ringkasan singkat halaman."
                        rows={3}
                        maxLength={300}
                        className={`${textareaClassName} mt-2`}
                      />

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-neutral-500">
                          Digunakan sebagai pengantar sebelum isi utama.
                        </p>

                        <span className="shrink-0 text-xs text-neutral-400">
                          {form.excerpt.length}
                          /300
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="page-content"
                        className="text-sm font-semibold text-neutral-800"
                      >
                        Isi halaman
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <textarea
                        id="page-content"
                        value={form.content}
                        onChange={(event) =>
                          updateForm("content", event.target.value)
                        }
                        placeholder="Tuliskan isi halaman secara lengkap."
                        rows={16}
                        maxLength={30000}
                        className={`${textareaClassName} mt-2 min-h-[360px] resize-y`}
                      />

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs leading-5 text-neutral-500">
                          Gunakan baris baru untuk memisahkan paragraf atau
                          ketentuan.
                        </p>

                        <div className="flex shrink-0 items-center gap-3 text-xs text-neutral-400">
                          <span>
                            {contentWordCount.toLocaleString("id-ID")} kata
                          </span>

                          <span>
                            {form.content.length}
                            /30000
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="page-status"
                        className="text-sm font-semibold text-neutral-800"
                      >
                        Status halaman
                      </label>

                      <select
                        id="page-status"
                        value={form.status}
                        onChange={(event) =>
                          updateForm(
                            "status",
                            event.target.value as ContentStatus,
                          )
                        }
                        className={`${inputClassName} mt-2`}
                      >
                        <option value="draft">Draft</option>

                        <option value="published">Dipublikasikan</option>

                        <option value="hidden">Disembunyikan</option>
                      </select>

                      <div
                        className={[
                          "mt-3 rounded-xl border px-4 py-3",
                          form.status === "published"
                            ? "border-emerald-200 bg-emerald-50"
                            : form.status === "draft"
                              ? "border-amber-200 bg-amber-50"
                              : "border-neutral-200 bg-neutral-50",
                        ].join(" ")}
                      >
                        <p
                          className={[
                            "text-sm font-semibold",
                            form.status === "published"
                              ? "text-emerald-800"
                              : form.status === "draft"
                                ? "text-amber-800"
                                : "text-neutral-700",
                          ].join(" ")}
                        >
                          {STATUS_LABELS[form.status]}
                        </p>

                        <p
                          className={[
                            "mt-1 text-xs leading-5",
                            form.status === "published"
                              ? "text-emerald-700"
                              : form.status === "draft"
                                ? "text-amber-700"
                                : "text-neutral-600",
                          ].join(" ")}
                        >
                          {form.status === "published"
                            ? "Halaman dapat ditampilkan pada website publik."
                            : form.status === "draft"
                              ? "Halaman masih dalam persiapan dan belum ditampilkan."
                              : "Halaman disimpan tetapi sementara tidak ditampilkan."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="border-t border-neutral-200 bg-neutral-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
                  <div className="lg:sticky lg:top-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                        Preview
                      </p>

                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
                          STATUS_CLASSES[form.status],
                        ].join(" ")}
                      >
                        {STATUS_LABELS[form.status]}
                      </span>
                    </div>

                    <article className="mt-4 max-h-[620px] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                        {currentConfiguration.shortLabel}
                      </p>

                      <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-neutral-950">
                        {form.title.trim() || currentConfiguration.label}
                      </h3>

                      {form.excerpt.trim() ? (
                        <p className="mt-3 text-sm font-medium leading-7 text-neutral-500">
                          {form.excerpt}
                        </p>
                      ) : null}

                      <div className="my-5 h-px bg-neutral-100" />

                      <PagePreviewContent content={form.content} />
                    </article>

                    <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-neutral-500">
                          Jumlah kata
                        </span>

                        <span className="text-sm font-semibold text-neutral-900">
                          {contentWordCount.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                        <span className="text-xs text-neutral-500">
                          Slug tetap
                        </span>

                        <span className="text-sm font-semibold text-neutral-900">
                          /{editingPage.slug}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? "Menyimpan..." : "Simpan Halaman"}
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={closeEditor}
                        className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </aside>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
