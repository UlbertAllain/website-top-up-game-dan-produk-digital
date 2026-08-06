"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import type {
  ContentItem,
  ContentStatus,
  TestimonialContentData,
} from "@/features/content/content.types";

type TestimonialManagerProps = {
  initialTestimonials: ContentItem[];
};

type TestimonialFormState = {
  customerName: string;
  customerRole: string;
  quote: string;
  rating: number;
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

const EMPTY_FORM: TestimonialFormState = {
  customerName: "",
  customerRole: "",
  quote: "",
  rating: 5,
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

function getTestimonialData(item: ContentItem): TestimonialContentData {
  return item.data as TestimonialContentData;
}

function sortTestimonials(testimonials: ContentItem[]): ContentItem[] {
  return [...testimonials].sort((firstTestimonial, secondTestimonial) => {
    const orderDifference = firstTestimonial.order - secondTestimonial.order;

    if (orderDifference !== 0) {
      return orderDifference;
    }

    return secondTestimonial.updatedAt.localeCompare(
      firstTestimonial.updatedAt,
    );
  });
}

function upsertTestimonial(
  testimonials: ContentItem[],
  savedTestimonial: ContentItem,
): ContentItem[] {
  const testimonialExists = testimonials.some(
    (testimonial) => testimonial.id === savedTestimonial.id,
  );

  if (!testimonialExists) {
    return sortTestimonials([...testimonials, savedTestimonial]);
  }

  return sortTestimonials(
    testimonials.map((testimonial) =>
      testimonial.id === savedTestimonial.id ? savedTestimonial : testimonial,
    ),
  );
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("id-ID");
}

function onlyDigits(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return digits.replace(/^0+(?=\d)/, "");
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

function createInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "P";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
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

function RatingStars({
  rating,
  size = "normal",
}: {
  rating: number;
  size?: "small" | "normal";
}) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rating ${rating} dari 5`}
    >
      {Array.from({
        length: 5,
      }).map((_, index) => {
        const isActive = index < rating;

        return (
          <svg
            key={index}
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={size === "small" ? "size-3.5" : "size-4"}
            fill={isActive ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
          </svg>
        );
      })}
    </div>
  );
}

function TestimonialAvatar({
  data,
  size = "normal",
}: {
  data: TestimonialContentData;
  size?: "normal" | "large";
}) {
  const sizeClass = size === "large" ? "size-16" : "size-12";

  const imageSize = size === "large" ? "64px" : "48px";

  return (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100",
        sizeClass,
      ].join(" ")}
    >
      {data.avatar ? (
        <Image
          src={data.avatar.secureUrl}
          alt={data.avatar.alt || data.customerName}
          fill
          sizes={imageSize}
          className="object-cover"
        />
      ) : (
        <span
          className={[
            "font-semibold text-neutral-600",
            size === "large" ? "text-lg" : "text-sm",
          ].join(" ")}
        >
          {createInitials(data.customerName)}
        </span>
      )}
    </div>
  );
}

export function TestimonialManager({
  initialTestimonials,
}: TestimonialManagerProps) {
  const router = useRouter();

  const [testimonials, setTestimonials] = useState<ContentItem[]>(
    sortTestimonials(initialTestimonials),
  );

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"" | ContentStatus>("");

  const [ratingFilter, setRatingFilter] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [editingTestimonial, setEditingTestimonial] =
    useState<ContentItem | null>(null);

  const [form, setForm] = useState<TestimonialFormState>(EMPTY_FORM);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const [formError, setFormError] = useState("");

  const [formNotice, setFormNotice] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isMediaBusy, setIsMediaBusy] = useState(false);

  const [testimonialToDelete, setTestimonialToDelete] =
    useState<ContentItem | null>(null);

  const [deleteError, setDeleteError] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);

  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);

    setAvatarPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile]);

  useEffect(() => {
    if (!isFormModalOpen && !testimonialToDelete) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (isSubmitting || isMediaBusy || isDeleting) {
        return;
      }

      setIsFormModalOpen(false);
      setTestimonialToDelete(null);
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [
    isFormModalOpen,
    testimonialToDelete,
    isSubmitting,
    isMediaBusy,
    isDeleting,
  ]);

  const filteredTestimonials = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return testimonials.filter((testimonial) => {
      if (statusFilter && testimonial.status !== statusFilter) {
        return false;
      }

      const data = getTestimonialData(testimonial);

      if (ratingFilter && data.rating !== Number(ratingFilter)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = normalizeSearch(
        [data.customerName, data.customerRole, data.quote].join(" "),
      );

      return searchableText.includes(normalizedSearch);
    });
  }, [testimonials, search, statusFilter, ratingFilter]);

  const publishedCount = testimonials.filter(
    (testimonial) => testimonial.status === "published",
  ).length;

  const testimonialsWithAvatar = testimonials.filter((testimonial) =>
    Boolean(getTestimonialData(testimonial).avatar),
  ).length;

  const averageRating =
    testimonials.length > 0
      ? testimonials.reduce(
          (total, testimonial) =>
            total + getTestimonialData(testimonial).rating,
          0,
        ) / testimonials.length
      : 0;

  const editingData = editingTestimonial
    ? getTestimonialData(editingTestimonial)
    : null;

  const currentAvatarUrl =
    avatarPreviewUrl ?? editingData?.avatar?.secureUrl ?? null;

  function updateForm<Key extends keyof TestimonialFormState>(
    key: Key,
    value: TestimonialFormState[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("");
    setRatingFilter("");
  }

  function resetAndCloseForm() {
    setIsFormModalOpen(false);

    setEditingTestimonial(null);

    setForm(EMPTY_FORM);
    setAvatarFile(null);
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
    setEditingTestimonial(null);

    setForm(EMPTY_FORM);
    setAvatarFile(null);
    setFormError("");
    setFormNotice("");
    setNotice("");
    setIsFormModalOpen(true);
  }

  function openEditModal(testimonial: ContentItem) {
    const data = getTestimonialData(testimonial);

    setEditingTestimonial(testimonial);

    setForm({
      customerName: data.customerName,

      customerRole: data.customerRole,

      quote: data.quote,
      rating: data.rating,

      status: testimonial.status,

      order: String(testimonial.order),
    });

    setAvatarFile(null);
    setFormError("");
    setFormNotice("");
    setNotice("");
    setIsFormModalOpen(true);
  }

  function validateForm(): string | null {
    const customerName = form.customerName.trim();

    const customerRole = form.customerRole.trim();

    const quote = form.quote.trim();

    if (customerName.length < 2) {
      return "Nama pelanggan minimal 2 karakter.";
    }

    if (customerName.length > 100) {
      return "Nama pelanggan maksimal 100 karakter.";
    }

    if (customerRole.length > 120) {
      return "Keterangan pelanggan maksimal 120 karakter.";
    }

    if (quote.length < 10) {
      return "Isi testimoni minimal 10 karakter.";
    }

    if (quote.length > 1200) {
      return "Isi testimoni maksimal 1200 karakter.";
    }

    if (!Number.isInteger(form.rating) || form.rating < 1 || form.rating > 5) {
      return "Rating harus berada antara 1 sampai 5.";
    }

    const order = Number(form.order || 0);

    if (!Number.isInteger(order) || order < 0 || order > 9999) {
      return "Urutan testimoni harus berupa angka antara 0 sampai 9999.";
    }

    if (avatarFile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(avatarFile.type)) {
        return "Format avatar harus JPG, PNG, atau WebP.";
      }

      if (avatarFile.size > 5 * 1024 * 1024) {
        return "Ukuran avatar maksimal 5 MB.";
      }
    }

    return null;
  }

  async function uploadAvatar(
    testimonialId: string,
    file: File,
  ): Promise<ContentItem> {
    const mediaForm = new FormData();

    mediaForm.append("file", file);

    mediaForm.append("alt", `Foto ${form.customerName.trim()}`);

    const response = await fetch(
      `/api/admin/content/testimonial/${testimonialId}/media`,
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
      throw new Error(getApiErrorMessage(result, "Avatar gagal diunggah."));
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
        customerName: form.customerName.trim(),

        customerRole: form.customerRole.trim(),

        quote: form.quote.trim(),

        rating: form.rating,

        status: form.status,

        order: Number(form.order || 0),
      };

      const response = await fetch(
        editingTestimonial
          ? `/api/admin/content/testimonial/${editingTestimonial.id}`
          : "/api/admin/content/testimonial",
        {
          method: editingTestimonial ? "PATCH" : "POST",

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
            editingTestimonial
              ? "Testimoni gagal diperbarui."
              : "Testimoni gagal dibuat.",
          ),
        );
      }

      let savedTestimonial = result.data.item;

      setTestimonials((currentTestimonials) =>
        upsertTestimonial(currentTestimonials, savedTestimonial),
      );

      if (avatarFile) {
        try {
          savedTestimonial = await uploadAvatar(
            savedTestimonial.id,
            avatarFile,
          );

          setTestimonials((currentTestimonials) =>
            upsertTestimonial(currentTestimonials, savedTestimonial),
          );
        } catch (mediaError) {
          setEditingTestimonial(savedTestimonial);

          setAvatarFile(null);

          setFormError(
            mediaError instanceof Error
              ? `Data testimoni sudah tersimpan, tetapi avatar gagal diunggah: ${mediaError.message}`
              : "Data testimoni sudah tersimpan, tetapi avatar gagal diunggah.",
          );

          router.refresh();
          return;
        }
      }

      setNotice(
        editingTestimonial
          ? "Testimoni berhasil diperbarui."
          : "Testimoni baru berhasil dibuat.",
      );

      router.refresh();
      resetAndCloseForm();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : editingTestimonial
            ? "Testimoni gagal diperbarui."
            : "Testimoni gagal dibuat.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveAvatar() {
    if (!editingTestimonial || !editingData?.avatar || isMediaBusy) {
      return;
    }

    setFormError("");
    setFormNotice("");
    setIsMediaBusy(true);

    try {
      const response = await fetch(
        `/api/admin/content/testimonial/${editingTestimonial.id}/media`,
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
        throw new Error(getApiErrorMessage(result, "Avatar gagal dihapus."));
      }

      const updatedTestimonial = result.data.item;

      setEditingTestimonial(updatedTestimonial);

      setTestimonials((currentTestimonials) =>
        upsertTestimonial(currentTestimonials, updatedTestimonial),
      );

      setFormNotice("Avatar berhasil dihapus.");

      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Avatar gagal dihapus.",
      );
    } finally {
      setIsMediaBusy(false);
    }
  }

  function requestDeleteTestimonial(testimonial: ContentItem) {
    setDeleteError("");

    setTestimonialToDelete(testimonial);
  }

  async function handleDeleteTestimonial() {
    if (!testimonialToDelete || isDeleting) {
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/content/testimonial/${testimonialToDelete.id}`,
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
        throw new Error(getApiErrorMessage(result, "Testimoni gagal dihapus."));
      }

      setTestimonials((currentTestimonials) =>
        currentTestimonials.filter(
          (testimonial) => testimonial.id !== testimonialToDelete.id,
        ),
      );

      setNotice("Testimoni berhasil dihapus.");

      setTestimonialToDelete(null);

      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Testimoni gagal dihapus.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">
            Total Testimoni
          </p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950">
            {testimonials.length}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Seluruh ulasan pelanggan.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Dipublikasikan</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-emerald-700">
            {publishedCount}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Dapat dilihat pengunjung.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">
            Rating Rata-rata
          </p>

          <div className="mt-4 flex items-end gap-2">
            <p className="text-3xl font-semibold tracking-tight text-amber-600">
              {averageRating.toLocaleString("id-ID", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </p>

            <span className="mb-1 text-sm text-neutral-400">/ 5</span>
          </div>

          <p className="mt-2 text-sm text-neutral-500">
            Berdasarkan testimoni tersimpan.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">
            Memiliki Avatar
          </p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-blue-700">
            {testimonialsWithAvatar}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Testimoni dengan foto pelanggan.
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

      <section className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm shadow-neutral-950/[0.02]">
        <div className="border-b border-neutral-200 p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_190px_170px]">
              <div className="relative sm:col-span-2 xl:col-span-1">
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
                  placeholder="Cari nama atau isi testimoni..."
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

              <select
                value={ratingFilter}
                onChange={(event) => setRatingFilter(event.target.value)}
                className={inputClassName}
              >
                <option value="">Semua rating</option>

                <option value="5">Rating 5</option>

                <option value="4">Rating 4</option>

                <option value="3">Rating 3</option>

                <option value="2">Rating 2</option>

                <option value="1">Rating 1</option>
              </select>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              <span className="text-lg leading-none">+</span>
              Tambah Testimoni
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">
              Menampilkan{" "}
              <strong className="font-semibold text-neutral-800">
                {filteredTestimonials.length}
              </strong>{" "}
              dari{" "}
              <strong className="font-semibold text-neutral-800">
                {testimonials.length}
              </strong>{" "}
              testimoni
            </p>

            {search || statusFilter || ratingFilter ? (
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

        {filteredTestimonials.length === 0 ? (
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
                <path d="M7 8h10" />
                <path d="M7 12h6" />
                <path d="M6 19 3 21v-4a9 9 0 1 1 3 2Z" />
              </svg>
            </div>

            <h2 className="mt-5 font-semibold text-neutral-900">
              Testimoni tidak ditemukan
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Ubah kata pencarian atau filter yang digunakan.
            </p>

            <button
              type="button"
              onClick={
                search || statusFilter || ratingFilter
                  ? resetFilters
                  : openCreateModal
              }
              className="mt-5 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {search || statusFilter || ratingFilter
                ? "Tampilkan semua"
                : "Tambah testimoni"}
            </button>
          </div>
        ) : (
          <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-2 2xl:grid-cols-3">
            {filteredTestimonials.map((testimonial) => {
              const data = getTestimonialData(testimonial);

              return (
                <article
                  key={testimonial.id}
                  className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <TestimonialAvatar data={data} />

                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-neutral-900">
                          {data.customerName}
                        </h2>

                        <p className="mt-1 truncate text-xs text-neutral-500">
                          {data.customerRole || "Pelanggan"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={[
                        "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset",
                        STATUS_CLASSES[testimonial.status],
                      ].join(" ")}
                    >
                      {STATUS_LABELS[testimonial.status]}
                    </span>
                  </div>

                  <div className="mt-4 text-amber-500">
                    <RatingStars rating={data.rating} />
                  </div>

                  <blockquote className="mt-4 flex-1">
                    <p className="line-clamp-5 text-sm leading-7 text-neutral-600">
                      “{data.quote}”
                    </p>
                  </blockquote>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                    <div>
                      <p className="text-[11px] text-neutral-400">
                        Urutan {testimonial.order}
                      </p>

                      <p className="mt-1 text-[11px] text-neutral-400">
                        {formatDate(testimonial.updatedAt)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(testimonial)}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => requestDeleteTestimonial(testimonial)}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
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
              aria-labelledby="testimonial-form-title"
              className="my-4 w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-5 sm:px-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                    CMS
                  </p>

                  <h2
                    id="testimonial-form-title"
                    className="mt-2 text-xl font-semibold tracking-tight text-neutral-950"
                  >
                    {editingTestimonial ? "Edit Testimoni" : "Tambah Testimoni"}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Kelola informasi pelanggan, isi ulasan, rating, dan avatar.
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
                className="grid lg:grid-cols-[minmax(0,1fr)_400px]"
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
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="testimonial-name"
                          className="text-sm font-semibold text-neutral-800"
                        >
                          Nama pelanggan
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                          id="testimonial-name"
                          type="text"
                          value={form.customerName}
                          onChange={(event) =>
                            updateForm("customerName", event.target.value)
                          }
                          placeholder="Contoh: Ahmad Rizki"
                          maxLength={100}
                          className={`${inputClassName} mt-2`}
                        />

                        <div className="mt-2 flex justify-end">
                          <span className="text-xs text-neutral-400">
                            {form.customerName.length}
                            /100
                          </span>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="testimonial-role"
                          className="text-sm font-semibold text-neutral-800"
                        >
                          Keterangan pelanggan
                        </label>

                        <input
                          id="testimonial-role"
                          type="text"
                          value={form.customerRole}
                          onChange={(event) =>
                            updateForm("customerRole", event.target.value)
                          }
                          placeholder="Contoh: Pelanggan Top Up"
                          maxLength={120}
                          className={`${inputClassName} mt-2`}
                        />

                        <div className="mt-2 flex justify-end">
                          <span className="text-xs text-neutral-400">
                            {form.customerRole.length}
                            /120
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="testimonial-quote"
                        className="text-sm font-semibold text-neutral-800"
                      >
                        Isi testimoni
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <textarea
                        id="testimonial-quote"
                        value={form.quote}
                        onChange={(event) =>
                          updateForm("quote", event.target.value)
                        }
                        placeholder="Tuliskan pengalaman pelanggan menggunakan layanan atau membeli produk."
                        rows={7}
                        maxLength={1200}
                        className={`${textareaClassName} mt-2`}
                      />

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-xs leading-5 text-neutral-500">
                          Gunakan kalimat asli pelanggan dan hindari klaim yang
                          berlebihan.
                        </p>

                        <span className="shrink-0 text-xs text-neutral-400">
                          {form.quote.length}
                          /1200
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-neutral-800">
                        Rating
                        <span className="ml-1 text-red-500">*</span>
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => updateForm("rating", rating)}
                            className={[
                              "flex h-11 min-w-11 items-center justify-center gap-1 rounded-xl border px-3 text-sm font-semibold transition",
                              form.rating === rating
                                ? "border-amber-300 bg-amber-50 text-amber-700 ring-4 ring-amber-500/10"
                                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
                            ].join(" ")}
                          >
                            {rating}

                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              className="size-3.5"
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="testimonial-status"
                          className="text-sm font-semibold text-neutral-800"
                        >
                          Status
                        </label>

                        <select
                          id="testimonial-status"
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
                          htmlFor="testimonial-order"
                          className="text-sm font-semibold text-neutral-800"
                        >
                          Urutan tampilan
                        </label>

                        <input
                          id="testimonial-order"
                          type="text"
                          inputMode="numeric"
                          value={form.order}
                          onChange={(event) =>
                            updateForm("order", onlyDigits(event.target.value))
                          }
                          placeholder="0"
                          className={`${inputClassName} mt-2`}
                        />

                        <p className="mt-2 text-xs leading-5 text-neutral-500">
                          Angka kecil ditampilkan lebih awal.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="testimonial-avatar"
                        className="text-sm font-semibold text-neutral-800"
                      >
                        Avatar pelanggan
                      </label>

                      <input
                        id="testimonial-avatar"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) =>
                          setAvatarFile(event.target.files?.[0] ?? null)
                        }
                        className="mt-2 block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-neutral-700 hover:file:bg-neutral-200"
                      />

                      <p className="mt-2 text-xs leading-5 text-neutral-500">
                        Opsional. Gunakan JPG, PNG, atau WebP maksimal 5 MB.
                      </p>

                      {avatarFile ? (
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-blue-50 px-3.5 py-3">
                          <p className="min-w-0 truncate text-xs font-medium text-blue-700">
                            {avatarFile.name}
                          </p>

                          <button
                            type="button"
                            onClick={() => setAvatarFile(null)}
                            className="shrink-0 text-xs font-semibold text-blue-700 hover:text-blue-900"
                          >
                            Batalkan
                          </button>
                        </div>
                      ) : null}

                      {editingData?.avatar && !avatarFile ? (
                        <button
                          type="button"
                          disabled={isMediaBusy || isSubmitting}
                          onClick={handleRemoveAvatar}
                          className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          {isMediaBusy
                            ? "Menghapus avatar..."
                            : "Hapus avatar saat ini"}
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

                    <article className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
                          {currentAvatarUrl ? (
                            <Image
                              src={currentAvatarUrl}
                              alt={form.customerName || "Preview avatar"}
                              fill
                              unoptimized={Boolean(avatarPreviewUrl)}
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="font-semibold text-neutral-600">
                              {createInitials(form.customerName)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-neutral-900">
                            {form.customerName.trim() || "Nama pelanggan"}
                          </p>

                          <p className="mt-1 truncate text-xs text-neutral-500">
                            {form.customerRole.trim() || "Pelanggan"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 text-amber-500">
                        <RatingStars rating={form.rating} />
                      </div>

                      <blockquote className="mt-4">
                        <p className="whitespace-pre-line text-sm leading-7 text-neutral-600">
                          “
                          {form.quote.trim() ||
                            "Isi testimoni pelanggan akan tampil di bagian ini."}
                          ”
                        </p>
                      </blockquote>
                    </article>

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
                          ? editingTestimonial
                            ? "Menyimpan..."
                            : "Membuat..."
                          : editingTestimonial
                            ? "Simpan Perubahan"
                            : "Buat Testimoni"}
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

      {testimonialToDelete ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setTestimonialToDelete(null);

              setDeleteError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-testimonial-title"
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
              id="delete-testimonial-title"
              className="mt-5 text-lg font-semibold text-neutral-950"
            >
              Hapus testimoni?
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Testimoni dari{" "}
              <strong className="font-semibold text-neutral-900">
                {getTestimonialData(testimonialToDelete).customerName}
              </strong>{" "}
              akan dihapus permanen. Avatar Cloudinary yang terhubung juga akan
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
                  setTestimonialToDelete(null);

                  setDeleteError("");
                }}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteTestimonial}
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
