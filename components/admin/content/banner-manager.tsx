"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import type {
  BannerContentData,
  ContentItem,
  ContentStatus,
} from "@/features/content/content.types";

type BannerManagerProps = {
  initialBanners: ContentItem[];
};

type BannerFormState = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  status: ContentStatus;
  order: string;
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

const EMPTY_FORM: BannerFormState = {
  title: "",
  subtitle: "",
  ctaLabel: "",
  ctaUrl: "",
  status: "draft",
  order: "",
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
  "text-sm leading-6 text-neutral-900 outline-none transition",
  "placeholder:text-neutral-400",
  "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
  "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500",
].join(" ");

function getBannerData(item: ContentItem): BannerContentData {
  return item.data as BannerContentData;
}

function sortBanners(banners: ContentItem[]): ContentItem[] {
  return [...banners].sort((firstBanner, secondBanner) => {
    const orderDifference = firstBanner.order - secondBanner.order;

    if (orderDifference !== 0) {
      return orderDifference;
    }

    return secondBanner.updatedAt.localeCompare(firstBanner.updatedAt);
  });
}

function onlyDigits(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return digits.replace(/^0+(?=\d)/, "");
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("id-ID");
}

function isValidCtaUrl(value: string): boolean {
  if (!value) {
    return true;
  }

  if (value.startsWith("/") && !value.startsWith("//")) {
    return true;
  }

  try {
    const url = new URL(value);

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
    const firstFieldError = Object.values(response.error.fields).flat()[0];

    if (firstFieldError) {
      return firstFieldError;
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

function upsertBanner(
  banners: ContentItem[],
  savedBanner: ContentItem,
): ContentItem[] {
  const exists = banners.some((banner) => banner.id === savedBanner.id);

  if (!exists) {
    return sortBanners([...banners, savedBanner]);
  }

  return sortBanners(
    banners.map((banner) =>
      banner.id === savedBanner.id ? savedBanner : banner,
    ),
  );
}

export function BannerManager({ initialBanners }: BannerManagerProps) {
  const router = useRouter();

  const [banners, setBanners] = useState<ContentItem[]>(
    sortBanners(initialBanners),
  );

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"" | ContentStatus>("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [editingBanner, setEditingBanner] = useState<ContentItem | null>(null);

  const [form, setForm] = useState<BannerFormState>(EMPTY_FORM);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [formError, setFormError] = useState("");

  const [formNotice, setFormNotice] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isMediaBusy, setIsMediaBusy] = useState(false);

  const [bannerToDelete, setBannerToDelete] = useState<ContentItem | null>(
    null,
  );

  const [deleteError, setDeleteError] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);

    setImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  useEffect(() => {
    if (!isFormModalOpen && !bannerToDelete) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (isSubmitting || isDeleting || isMediaBusy) {
        return;
      }

      setIsFormModalOpen(false);
      setBannerToDelete(null);
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isFormModalOpen, bannerToDelete, isSubmitting, isDeleting, isMediaBusy]);

  const filteredBanners = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return banners.filter((banner) => {
      if (statusFilter && banner.status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const data = getBannerData(banner);

      const searchableText = normalizeSearch(
        [data.title, data.subtitle, data.ctaLabel, data.ctaUrl].join(" "),
      );

      return searchableText.includes(normalizedSearch);
    });
  }, [banners, search, statusFilter]);

  const publishedCount = banners.filter(
    (banner) => banner.status === "published",
  ).length;

  const draftCount = banners.filter(
    (banner) => banner.status === "draft",
  ).length;

  const hiddenCount = banners.filter(
    (banner) => banner.status === "hidden",
  ).length;

  const editingBannerData = editingBanner ? getBannerData(editingBanner) : null;

  const currentPreviewUrl =
    imagePreviewUrl ?? editingBannerData?.image?.secureUrl ?? null;

  function updateForm<Key extends keyof BannerFormState>(
    key: Key,
    value: BannerFormState[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function resetAndCloseForm() {
    setIsFormModalOpen(false);
    setEditingBanner(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setFormError("");
    setFormNotice("");
  }

  function handleCloseForm() {
    if (isSubmitting || isMediaBusy) {
      return;
    }

    resetAndCloseForm();
  }

  function openCreateModal() {
    setEditingBanner(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setFormError("");
    setFormNotice("");
    setIsFormModalOpen(true);
  }

  function openEditModal(banner: ContentItem) {
    const data = getBannerData(banner);

    setEditingBanner(banner);

    setForm({
      title: data.title,
      subtitle: data.subtitle,
      ctaLabel: data.ctaLabel,
      ctaUrl: data.ctaUrl,
      status: banner.status,
      order: String(banner.order),
    });

    setImageFile(null);
    setFormError("");
    setFormNotice("");
    setIsFormModalOpen(true);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("");
  }

  function validateForm(): string | null {
    if (form.title.trim().length < 3) {
      return "Judul banner minimal 3 karakter.";
    }

    if (form.title.trim().length > 120) {
      return "Judul banner maksimal 120 karakter.";
    }

    if (form.subtitle.trim().length > 300) {
      return "Subjudul maksimal 300 karakter.";
    }

    if (form.ctaLabel.trim().length > 60) {
      return "Teks tombol maksimal 60 karakter.";
    }

    const hasCtaLabel = Boolean(form.ctaLabel.trim());

    const hasCtaUrl = Boolean(form.ctaUrl.trim());

    if (hasCtaLabel && !hasCtaUrl) {
      return "Alamat tujuan tombol wajib diisi.";
    }

    if (!hasCtaLabel && hasCtaUrl) {
      return "Teks tombol wajib diisi.";
    }

    if (!isValidCtaUrl(form.ctaUrl.trim())) {
      return "Alamat tujuan harus berupa path internal seperti /products atau URL lengkap.";
    }

    const order = Number(form.order || 0);

    if (!Number.isInteger(order) || order < 0 || order > 9999) {
      return "Urutan banner harus berupa angka antara 0 sampai 9999.";
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      return "Ukuran gambar maksimal 5 MB.";
    }

    return null;
  }

  async function uploadBannerImage(
    bannerId: string,
    file: File,
  ): Promise<ContentItem> {
    const mediaForm = new FormData();

    mediaForm.append("file", file);

    mediaForm.append("alt", `Banner ${form.title.trim()}`);

    const response = await fetch(
      `/api/admin/content/banner/${bannerId}/media`,
      {
        method: "POST",
        body: mediaForm,
        credentials: "same-origin",
        cache: "no-store",
      },
    );

    const result = (await response.json()) as ApiResponse<{
      item: ContentItem;
    }>;

    if (!response.ok || !result.success || !result.data?.item) {
      throw new Error(
        getApiErrorMessage(result, "Gambar banner gagal diunggah."),
      );
    }

    return result.data.item;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || isMediaBusy) {
      return;
    }

    setFormError("");
    setFormNotice("");

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);

      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),

        subtitle: form.subtitle.trim(),

        ctaLabel: form.ctaLabel.trim(),

        ctaUrl: form.ctaUrl.trim(),

        status: form.status,

        order: Number(form.order || 0),
      };

      const response = await fetch(
        editingBanner
          ? `/api/admin/content/banner/${editingBanner.id}`
          : "/api/admin/content/banner",
        {
          method: editingBanner ? "PATCH" : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),

          credentials: "same-origin",

          cache: "no-store",
        },
      );

      const result = (await response.json()) as ApiResponse<{
        item: ContentItem;
      }>;

      if (!response.ok || !result.success || !result.data?.item) {
        throw new Error(
          getApiErrorMessage(
            result,
            editingBanner ? "Banner gagal diperbarui." : "Banner gagal dibuat.",
          ),
        );
      }

      let savedBanner = result.data.item;

      setBanners((currentBanners) => upsertBanner(currentBanners, savedBanner));

      if (imageFile) {
        try {
          savedBanner = await uploadBannerImage(savedBanner.id, imageFile);

          setBanners((currentBanners) =>
            upsertBanner(currentBanners, savedBanner),
          );
        } catch (mediaError) {
          setEditingBanner(savedBanner);

          setImageFile(null);

          setFormError(
            mediaError instanceof Error
              ? `Data banner sudah tersimpan, tetapi gambar gagal diunggah: ${mediaError.message}`
              : "Data banner sudah tersimpan, tetapi gambar gagal diunggah.",
          );

          router.refresh();
          return;
        }
      }

      router.refresh();
      resetAndCloseForm();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : editingBanner
            ? "Banner gagal diperbarui."
            : "Banner gagal dibuat.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveImage() {
    if (!editingBanner || !editingBannerData?.image || isMediaBusy) {
      return;
    }

    setFormError("");
    setFormNotice("");
    setIsMediaBusy(true);

    try {
      const response = await fetch(
        `/api/admin/content/banner/${editingBanner.id}/media`,
        {
          method: "DELETE",
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      const result = (await response.json()) as ApiResponse<{
        item: ContentItem;
      }>;

      if (!response.ok || !result.success || !result.data?.item) {
        throw new Error(
          getApiErrorMessage(result, "Gambar banner gagal dihapus."),
        );
      }

      const updatedBanner = result.data.item;

      setEditingBanner(updatedBanner);

      setBanners((currentBanners) =>
        upsertBanner(currentBanners, updatedBanner),
      );

      setFormNotice("Gambar banner berhasil dihapus.");

      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Gambar banner gagal dihapus.",
      );
    } finally {
      setIsMediaBusy(false);
    }
  }

  async function handleDeleteBanner() {
    if (!bannerToDelete || isDeleting) {
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/content/banner/${bannerToDelete.id}`,
        {
          method: "DELETE",
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      const result = (await response.json()) as ApiResponse<{
        deleted: boolean;
        contentId: string;
      }>;

      if (!response.ok || !result.success) {
        throw new Error(getApiErrorMessage(result, "Banner gagal dihapus."));
      }

      setBanners((currentBanners) =>
        currentBanners.filter((banner) => banner.id !== bannerToDelete.id),
      );

      setBannerToDelete(null);
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Banner gagal dihapus.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Total Banner</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950">
            {banners.length}
          </p>

          <p className="mt-2 text-sm text-neutral-500">Seluruh banner CMS.</p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Dipublikasikan</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-emerald-700">
            {publishedCount}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Siap tampil di website.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Draft</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-amber-700">
            {draftCount}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Masih dalam persiapan.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Disembunyikan</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-700">
            {hiddenCount}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Tidak tampil sementara.
          </p>
        </article>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm shadow-neutral-950/[0.02]">
        <div className="border-b border-neutral-200 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(220px,1fr)_190px]">
              <div className="relative">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />

                  <path d="m20 20-3.5-3.5" />
                </svg>

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari judul banner..."
                  className={`${inputClassName} pl-10`}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "" | ContentStatus)
                }
                className={inputClassName}
              >
                <option value="">Semua status</option>

                <option value="published">Dipublikasikan</option>

                <option value="draft">Draft</option>

                <option value="hidden">Disembunyikan</option>
              </select>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              <span className="text-lg leading-none">+</span>
              Tambah Banner
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">
              Menampilkan{" "}
              <strong className="font-semibold text-neutral-800">
                {filteredBanners.length}
              </strong>{" "}
              dari{" "}
              <strong className="font-semibold text-neutral-800">
                {banners.length}
              </strong>{" "}
              banner
            </p>

            {search || statusFilter ? (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Reset filter
              </button>
            ) : null}
          </div>
        </div>

        {filteredBanners.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />

                <path d="m7 15 3-3 2.5 2.5L16 11l3 4" />
              </svg>
            </div>

            <h2 className="mt-5 font-semibold text-neutral-900">
              Banner tidak ditemukan
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Ubah pencarian atau filter status yang digunakan.
            </p>

            <button
              type="button"
              onClick={search || statusFilter ? resetFilters : openCreateModal}
              className="mt-5 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {search || statusFilter ? "Tampilkan semua" : "Tambah banner"}
            </button>
          </div>
        ) : (
          <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-2 2xl:grid-cols-3">
            {filteredBanners.map((banner) => {
              const data = getBannerData(banner);

              return (
                <article
                  key={banner.id}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                >
                  <div className="relative aspect-[16/8] overflow-hidden bg-neutral-950">
                    {data.image ? (
                      <Image
                        src={data.image.secureUrl}
                        alt={data.image.alt || data.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 500px"
                        className="object-cover opacity-80"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,#171717,#353535)]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/25 to-transparent" />

                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset backdrop-blur",
                          banner.status === "published"
                            ? "bg-emerald-50/95 text-emerald-700 ring-emerald-600/10"
                            : banner.status === "draft"
                              ? "bg-amber-50/95 text-amber-700 ring-amber-600/10"
                              : "bg-white/90 text-neutral-700 ring-neutral-500/10",
                        ].join(" ")}
                      >
                        {STATUS_LABELS[banner.status]}
                      </span>

                      <span className="rounded-full bg-neutral-950/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                        Urutan {banner.order}
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-white">
                        {data.title}
                      </h2>

                      {data.subtitle ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/70">
                          {data.subtitle}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex min-h-10 items-center justify-between gap-3">
                      {data.ctaLabel ? (
                        <div className="min-w-0">
                          <p className="text-[11px] text-neutral-500">Tombol</p>

                          <p className="mt-1 truncate text-sm font-semibold text-neutral-800">
                            {data.ctaLabel}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-400">
                          Tanpa tombol CTA
                        </p>
                      )}

                      <p className="shrink-0 text-right text-[11px] leading-5 text-neutral-400">
                        Diperbarui
                        <br />
                        {formatDate(banner.updatedAt)}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-neutral-100 pt-4">
                      <button
                        type="button"
                        onClick={() => openEditModal(banner)}
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError("");

                          setBannerToDelete(banner);
                        }}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {isFormModalOpen ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] overflow-y-auto bg-neutral-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isSubmitting &&
              !isMediaBusy
            ) {
              handleCloseForm();
            }
          }}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="banner-form-title"
              className="my-4 w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-5 sm:px-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                    CMS
                  </p>

                  <h2
                    id="banner-form-title"
                    className="mt-2 text-xl font-semibold tracking-tight text-neutral-950"
                  >
                    {editingBanner ? "Edit Banner" : "Tambah Banner"}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Atur teks, gambar, tombol, status, dan urutan banner.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={isSubmitting || isMediaBusy}
                  aria-label="Tutup formulir"
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
                className="grid lg:grid-cols-[minmax(0,1fr)_420px]"
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

                  {formNotice ? (
                    <div
                      role="status"
                      className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
                    >
                      {formNotice}
                    </div>
                  ) : null}

                  <div className="grid gap-5">
                    <div>
                      <label
                        htmlFor="banner-title"
                        className="text-sm font-semibold text-neutral-800"
                      >
                        Judul banner
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <input
                        id="banner-title"
                        type="text"
                        value={form.title}
                        onChange={(event) =>
                          updateForm("title", event.target.value)
                        }
                        placeholder="Contoh: Semua Kebutuhan Digital dalam Satu Tempat"
                        maxLength={120}
                        className={`${inputClassName} mt-2`}
                      />

                      <div className="mt-2 flex justify-end">
                        <span className="text-xs text-neutral-400">
                          {form.title.length}
                          /120
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="banner-subtitle"
                        className="text-sm font-semibold text-neutral-800"
                      >
                        Subjudul
                      </label>

                      <textarea
                        id="banner-subtitle"
                        value={form.subtitle}
                        onChange={(event) =>
                          updateForm("subtitle", event.target.value)
                        }
                        placeholder="Jelaskan isi atau promosi banner secara singkat."
                        rows={4}
                        maxLength={300}
                        className={`${textareaClassName} mt-2`}
                      />

                      <div className="mt-2 flex justify-end">
                        <span className="text-xs text-neutral-400">
                          {form.subtitle.length}
                          /300
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="banner-cta-label"
                          className="text-sm font-semibold text-neutral-800"
                        >
                          Teks tombol
                        </label>

                        <input
                          id="banner-cta-label"
                          type="text"
                          value={form.ctaLabel}
                          onChange={(event) =>
                            updateForm("ctaLabel", event.target.value)
                          }
                          placeholder="Contoh: Lihat Produk"
                          maxLength={60}
                          className={`${inputClassName} mt-2`}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="banner-cta-url"
                          className="text-sm font-semibold text-neutral-800"
                        >
                          Alamat tujuan
                        </label>

                        <input
                          id="banner-cta-url"
                          type="text"
                          value={form.ctaUrl}
                          onChange={(event) =>
                            updateForm("ctaUrl", event.target.value)
                          }
                          placeholder="/products"
                          maxLength={500}
                          className={`${inputClassName} mt-2`}
                        />
                      </div>
                    </div>

                    <p className="-mt-2 text-xs leading-5 text-neutral-500">
                      Tombol dan alamat tujuan harus diisi bersamaan. Gunakan
                      path internal seperti{" "}
                      <strong className="font-semibold text-neutral-700">
                        /products
                      </strong>{" "}
                      atau URL lengkap.
                    </p>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="banner-status"
                          className="text-sm font-semibold text-neutral-800"
                        >
                          Status
                        </label>

                        <select
                          id="banner-status"
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
                      </div>

                      <div>
                        <label
                          htmlFor="banner-order"
                          className="text-sm font-semibold text-neutral-800"
                        >
                          Urutan tampilan
                        </label>

                        <input
                          id="banner-order"
                          type="text"
                          inputMode="numeric"
                          value={form.order}
                          onChange={(event) =>
                            updateForm("order", onlyDigits(event.target.value))
                          }
                          placeholder="0"
                          className={`${inputClassName} mt-2`}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="banner-image"
                        className="text-sm font-semibold text-neutral-800"
                      >
                        Gambar banner
                      </label>

                      <input
                        id="banner-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) =>
                          setImageFile(event.target.files?.[0] ?? null)
                        }
                        className="mt-2 block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-neutral-700 hover:file:bg-neutral-200"
                      />

                      <p className="mt-2 text-xs leading-5 text-neutral-500">
                        Format JPG, PNG, atau WebP. Ukuran maksimal 5 MB.
                      </p>

                      {imageFile ? (
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-blue-50 px-3.5 py-3">
                          <p className="min-w-0 truncate text-xs font-medium text-blue-700">
                            {imageFile.name}
                          </p>

                          <button
                            type="button"
                            onClick={() => setImageFile(null)}
                            className="shrink-0 text-xs font-semibold text-blue-700 hover:text-blue-900"
                          >
                            Batalkan
                          </button>
                        </div>
                      ) : null}

                      {editingBannerData?.image && !imageFile ? (
                        <button
                          type="button"
                          disabled={isMediaBusy || isSubmitting}
                          onClick={handleRemoveImage}
                          className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          {isMediaBusy
                            ? "Menghapus gambar..."
                            : "Hapus gambar saat ini"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <aside className="border-t border-neutral-200 bg-neutral-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
                  <div className="lg:sticky lg:top-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                      Preview
                    </p>

                    <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-2xl bg-neutral-950 shadow-xl shadow-neutral-950/10">
                      {currentPreviewUrl ? (
                        <Image
                          src={currentPreviewUrl}
                          alt={form.title || "Preview banner"}
                          fill
                          unoptimized={Boolean(imagePreviewUrl)}
                          sizes="420px"
                          className="object-cover opacity-80"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#171717,#3f3f46)]" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/45 to-transparent" />

                      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                        <span className="mb-3 w-fit rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur">
                          Produk Digital
                        </span>

                        <h3 className="max-w-sm text-xl font-semibold leading-tight text-white sm:text-2xl">
                          {form.title || "Judul banner akan tampil di sini"}
                        </h3>

                        <p className="mt-2 line-clamp-3 max-w-sm text-xs leading-5 text-white/65">
                          {form.subtitle ||
                            "Subjudul banner akan membantu pengunjung memahami promosi atau informasi utama."}
                        </p>

                        {form.ctaLabel ? (
                          <span className="mt-4 inline-flex h-9 w-fit items-center justify-center rounded-lg bg-white px-3.5 text-xs font-semibold text-neutral-950">
                            {form.ctaLabel}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-neutral-500">Status</span>

                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
                            STATUS_CLASSES[form.status],
                          ].join(" ")}
                        >
                          {STATUS_LABELS[form.status]}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                        <span className="text-xs text-neutral-500">Urutan</span>

                        <span className="text-sm font-semibold text-neutral-900">
                          {Number(form.order || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || isMediaBusy}
                        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting
                          ? editingBanner
                            ? "Menyimpan..."
                            : "Membuat..."
                          : editingBanner
                            ? "Simpan Perubahan"
                            : "Buat Banner"}
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting || isMediaBusy}
                        onClick={handleCloseForm}
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

      {bannerToDelete ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setBannerToDelete(null);

              setDeleteError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-banner-title"
            className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M6 7l1 14h10l1-14" />
                <path d="M9 7V4h6v3" />
              </svg>
            </div>

            <h2
              id="delete-banner-title"
              className="mt-5 text-lg font-semibold text-neutral-950"
            >
              Hapus banner?
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Banner{" "}
              <strong className="font-semibold text-neutral-900">
                {getBannerData(bannerToDelete).title}
              </strong>{" "}
              akan dihapus permanen. Gambar Cloudinary yang terhubung juga akan
              dibersihkan.
            </p>

            {deleteError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-6 text-red-700">
                {deleteError}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setBannerToDelete(null);

                  setDeleteError("");
                }}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteBanner}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Menghapus..." : "Hapus permanen"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
