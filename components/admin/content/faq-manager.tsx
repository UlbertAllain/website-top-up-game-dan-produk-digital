"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import type {
  ContentItem,
  ContentStatus,
  FaqContentData,
} from "@/features/content/content.types";

type FaqManagerProps = {
  initialFaqs: ContentItem[];
};

type FaqFormState = {
  question: string;
  answer: string;
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

const EMPTY_FORM: FaqFormState = {
  question: "",
  answer: "",
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

function getFaqData(item: ContentItem): FaqContentData {
  return item.data as FaqContentData;
}

function sortFaqs(faqs: ContentItem[]): ContentItem[] {
  return [...faqs].sort((firstFaq, secondFaq) => {
    const orderDifference = firstFaq.order - secondFaq.order;

    if (orderDifference !== 0) {
      return orderDifference;
    }

    return firstFaq.createdAt.localeCompare(secondFaq.createdAt);
  });
}

function upsertFaq(faqs: ContentItem[], savedFaq: ContentItem): ContentItem[] {
  const faqExists = faqs.some((faq) => faq.id === savedFaq.id);

  if (!faqExists) {
    return sortFaqs([...faqs, savedFaq]);
  }

  return sortFaqs(faqs.map((faq) => (faq.id === savedFaq.id ? savedFaq : faq)));
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

export function FaqManager({ initialFaqs }: FaqManagerProps) {
  const router = useRouter();

  const [faqs, setFaqs] = useState<ContentItem[]>(sortFaqs(initialFaqs));

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"" | ContentStatus>("");

  const [openFaqId, setOpenFaqId] = useState<string | null>(
    initialFaqs[0]?.id ?? null,
  );

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [editingFaq, setEditingFaq] = useState<ContentItem | null>(null);

  const [form, setForm] = useState<FaqFormState>(EMPTY_FORM);

  const [formError, setFormError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [faqToDelete, setFaqToDelete] = useState<ContentItem | null>(null);

  const [deleteError, setDeleteError] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);

  const [notice, setNotice] = useState("");

  const filteredFaqs = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return faqs.filter((faq) => {
      if (statusFilter && faq.status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const data = getFaqData(faq);

      const searchableText = normalizeSearch(
        [data.question, data.answer].join(" "),
      );

      return searchableText.includes(normalizedSearch);
    });
  }, [faqs, search, statusFilter]);

  const publishedCount = faqs.filter(
    (faq) => faq.status === "published",
  ).length;

  const draftCount = faqs.filter((faq) => faq.status === "draft").length;

  const hiddenCount = faqs.filter((faq) => faq.status === "hidden").length;

  useEffect(() => {
    if (!isFormModalOpen && !faqToDelete) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (isSubmitting || isDeleting) {
        return;
      }

      setIsFormModalOpen(false);
      setFaqToDelete(null);
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isFormModalOpen, faqToDelete, isSubmitting, isDeleting]);

  function updateForm<Key extends keyof FaqFormState>(
    key: Key,
    value: FaqFormState[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("");
  }

  function resetAndCloseForm() {
    setIsFormModalOpen(false);
    setEditingFaq(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  function handleCloseForm() {
    if (isSubmitting) {
      return;
    }

    resetAndCloseForm();
  }

  function openCreateModal() {
    setEditingFaq(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setNotice("");
    setIsFormModalOpen(true);
  }

  function openEditModal(faq: ContentItem) {
    const data = getFaqData(faq);

    setEditingFaq(faq);

    setForm({
      question: data.question,
      answer: data.answer,
      status: faq.status,
      order: String(faq.order),
    });

    setFormError("");
    setNotice("");
    setIsFormModalOpen(true);
  }

  function validateForm(): string | null {
    const question = form.question.trim();

    const answer = form.answer.trim();

    if (question.length < 5) {
      return "Pertanyaan minimal 5 karakter.";
    }

    if (question.length > 200) {
      return "Pertanyaan maksimal 200 karakter.";
    }

    if (answer.length < 10) {
      return "Jawaban minimal 10 karakter.";
    }

    if (answer.length > 3000) {
      return "Jawaban maksimal 3000 karakter.";
    }

    const order = Number(form.order || 0);

    if (!Number.isInteger(order) || order < 0 || order > 9999) {
      return "Urutan FAQ harus berupa angka antara 0 sampai 9999.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
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
      const payload = {
        question: form.question.trim(),

        answer: form.answer.trim(),

        status: form.status,

        order: Number(form.order || 0),
      };

      const response = await fetch(
        editingFaq
          ? `/api/admin/content/faq/${editingFaq.id}`
          : "/api/admin/content/faq",
        {
          method: editingFaq ? "PATCH" : "POST",

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
            editingFaq ? "FAQ gagal diperbarui." : "FAQ gagal dibuat.",
          ),
        );
      }

      const savedFaq = result.data.item;

      setFaqs((currentFaqs) => upsertFaq(currentFaqs, savedFaq));

      setOpenFaqId(savedFaq.id);

      setNotice(
        editingFaq ? "FAQ berhasil diperbarui." : "FAQ baru berhasil dibuat.",
      );

      router.refresh();
      resetAndCloseForm();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : editingFaq
            ? "FAQ gagal diperbarui."
            : "FAQ gagal dibuat.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function requestDeleteFaq(faq: ContentItem) {
    setDeleteError("");
    setFaqToDelete(faq);
  }

  async function handleDeleteFaq() {
    if (!faqToDelete || isDeleting) {
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/content/faq/${faqToDelete.id}`, {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
      });

      const result = (await response.json()) as ApiResponse<{
        deleted: boolean;
        contentId: string;
      }>;

      if (!response.ok || !result.success) {
        throw new Error(getApiErrorMessage(result, "FAQ gagal dihapus."));
      }

      setFaqs((currentFaqs) =>
        currentFaqs.filter((faq) => faq.id !== faqToDelete.id),
      );

      if (openFaqId === faqToDelete.id) {
        setOpenFaqId(null);
      }

      setNotice("FAQ berhasil dihapus.");

      setFaqToDelete(null);
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "FAQ gagal dihapus.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Total FAQ</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950">
            {faqs.length}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Seluruh pertanyaan dan jawaban.
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
          <p className="text-sm font-medium text-neutral-500">Draft</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-amber-700">
            {draftCount}
          </p>

          <p className="mt-2 text-sm text-neutral-500">Belum dipublikasikan.</p>
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
                  placeholder="Cari pertanyaan atau jawaban..."
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
              Tambah FAQ
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">
              Menampilkan{" "}
              <strong className="font-semibold text-neutral-800">
                {filteredFaqs.length}
              </strong>{" "}
              dari{" "}
              <strong className="font-semibold text-neutral-800">
                {faqs.length}
              </strong>{" "}
              FAQ
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

        {filteredFaqs.length === 0 ? (
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
                <circle cx="12" cy="12" r="9" />

                <path d="M9.8 9a2.4 2.4 0 0 1 4.6 1c0 1.7-2.4 2-2.4 3.5" />
                <path d="M12 17h.01" />
              </svg>
            </div>

            <h2 className="mt-5 font-semibold text-neutral-900">
              FAQ tidak ditemukan
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Ubah pencarian atau filter status yang digunakan.
            </p>

            <button
              type="button"
              onClick={search || statusFilter ? resetFilters : openCreateModal}
              className="mt-5 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {search || statusFilter ? "Tampilkan semua" : "Tambah FAQ"}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredFaqs.map((faq, index) => {
              const data = getFaqData(faq);

              const isOpen = openFaqId === faq.id;

              return (
                <article key={faq.id} className="px-4 py-4 sm:px-5">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-content-${faq.id}`}
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="flex w-full items-start gap-3 text-left"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-xs font-semibold text-neutral-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block pr-2 text-sm font-semibold leading-6 text-neutral-900 sm:text-base">
                        {data.question}
                      </span>

                      <span className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
                            STATUS_CLASSES[faq.status],
                          ].join(" ")}
                        >
                          {STATUS_LABELS[faq.status]}
                        </span>

                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
                          Urutan {faq.order}
                        </span>

                        <span className="text-[11px] text-neutral-400">
                          Diperbarui {formatDate(faq.updatedAt)}
                        </span>
                      </span>
                    </span>

                    <span
                      className={[
                        "mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition",
                        isOpen ? "rotate-180 bg-neutral-50" : "",
                      ].join(" ")}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>

                  {isOpen ? (
                    <div
                      id={`faq-content-${faq.id}`}
                      className="ml-12 mt-4 sm:ml-12"
                    >
                      <div className="rounded-xl bg-neutral-50 px-4 py-4">
                        <p className="whitespace-pre-line text-sm leading-7 text-neutral-600">
                          {data.answer}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(faq)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          Edit FAQ
                        </button>

                        <button
                          type="button"
                          onClick={() => requestDeleteFaq(faq)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : null}
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
            if (event.target === event.currentTarget && !isSubmitting) {
              handleCloseForm();
            }
          }}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="faq-form-title"
              className="my-4 w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-5 sm:px-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                    CMS
                  </p>

                  <h2
                    id="faq-form-title"
                    className="mt-2 text-xl font-semibold tracking-tight text-neutral-950"
                  >
                    {editingFaq ? "Edit FAQ" : "Tambah FAQ"}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Buat pertanyaan dan jawaban yang mudah dipahami pelanggan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={isSubmitting}
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

              <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
                {formError ? (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                    {formError}
                  </div>
                ) : null}

                <div className="grid gap-5">
                  <div>
                    <label
                      htmlFor="faq-question"
                      className="text-sm font-semibold text-neutral-800"
                    >
                      Pertanyaan
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="faq-question"
                      type="text"
                      value={form.question}
                      onChange={(event) =>
                        updateForm("question", event.target.value)
                      }
                      placeholder="Contoh: Bagaimana cara melakukan pemesanan?"
                      maxLength={200}
                      className={`${inputClassName} mt-2`}
                    />

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-xs leading-5 text-neutral-500">
                        Gunakan bahasa yang biasa ditanyakan pelanggan.
                      </p>

                      <span className="shrink-0 text-xs text-neutral-400">
                        {form.question.length}
                        /200
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="faq-answer"
                      className="text-sm font-semibold text-neutral-800"
                    >
                      Jawaban
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <textarea
                      id="faq-answer"
                      value={form.answer}
                      onChange={(event) =>
                        updateForm("answer", event.target.value)
                      }
                      placeholder="Tuliskan jawaban yang jelas, singkat, dan tidak menggunakan istilah teknis."
                      rows={8}
                      maxLength={3000}
                      className={`${textareaClassName} mt-2`}
                    />

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-xs leading-5 text-neutral-500">
                        Gunakan baris baru apabila jawaban memiliki beberapa
                        langkah.
                      </p>

                      <span className="shrink-0 text-xs text-neutral-400">
                        {form.answer.length}
                        /3000
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="faq-status"
                        className="text-sm font-semibold text-neutral-800"
                      >
                        Status
                      </label>

                      <select
                        id="faq-status"
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

                      <p className="mt-2 text-xs leading-5 text-neutral-500">
                        Hanya FAQ dengan status dipublikasikan yang tampil di
                        website.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="faq-order"
                        className="text-sm font-semibold text-neutral-800"
                      >
                        Urutan tampilan
                      </label>

                      <input
                        id="faq-order"
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
                        Angka lebih kecil akan ditampilkan lebih awal.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-600 shadow-sm">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="size-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="9" />

                          <path d="M12 11v5" />
                          <path d="M12 8h.01" />
                        </svg>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-neutral-800">
                          Preview pertanyaan
                        </p>

                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                          {form.question.trim() ||
                            "Pertanyaan akan tampil di bagian ini."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    disabled={isSubmitting}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? editingFaq
                        ? "Menyimpan..."
                        : "Membuat..."
                      : editingFaq
                        ? "Simpan Perubahan"
                        : "Buat FAQ"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {faqToDelete ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setFaqToDelete(null);
              setDeleteError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-faq-title"
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
              id="delete-faq-title"
              className="mt-5 text-lg font-semibold text-neutral-950"
            >
              Hapus FAQ?
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Pertanyaan{" "}
              <strong className="font-semibold text-neutral-900">
                “{getFaqData(faqToDelete).question}”
              </strong>{" "}
              akan dihapus permanen dan tidak dapat dikembalikan.
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
                  setFaqToDelete(null);
                  setDeleteError("");
                }}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteFaq}
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
