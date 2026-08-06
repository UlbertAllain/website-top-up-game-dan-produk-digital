"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import type { Category } from "@/features/categories/category.types";

type CategoryManagerProps = {
  initialCategories: Category[];
  productCounts: Record<string, number>;
};

type CategoryType = Category["type"];
type CategoryStatus = Category["status"];

type CategoryFormState = {
  name: string;
  type: CategoryType;
  description: string;
  status: CategoryStatus;
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

const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  top_up: "Top Up Game",
  game_account: "Akun Game",
  subscription: "Subscription",
  phone_number: "Nomor Kosong",
};

const CATEGORY_TYPE_DESCRIPTIONS: Record<CategoryType, string> = {
  top_up:
    "Digunakan untuk produk diamond, voucher, credit, dan mata uang game.",

  game_account:
    "Digunakan untuk produk akun game yang dijual berdasarkan detail akun.",

  subscription:
    "Digunakan untuk aplikasi premium, layanan berlangganan, dan akses digital.",

  phone_number:
    "Digunakan untuk produk nomor berdasarkan negara, provider, atau jenis nomor.",
};

const EMPTY_FORM: CategoryFormState = {
  name: "",
  type: "top_up",
  description: "",
  status: "active",
  order: "",
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

function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((firstCategory, secondCategory) => {
    const orderDifference = firstCategory.order - secondCategory.order;

    if (orderDifference !== 0) {
      return orderDifference;
    }

    return firstCategory.name.localeCompare(secondCategory.name, "id");
  });
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

function CategoryTypeIcon({ type }: { type: CategoryType }) {
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

  switch (type) {
    case "top_up":
      return (
        <svg {...commonProps}>
          <path d="M6 8h12a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-1l-2-2H9l-2 2H6a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3Z" />
          <path d="M8 12v4" />
          <path d="M6 14h4" />
          <path d="M16 13h.01" />
          <path d="M18 15h.01" />
        </svg>
      );

    case "game_account":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0 1 14 0" />
          <path d="m17 4 1 1" />
        </svg>
      );

    case "subscription":
      return (
        <svg {...commonProps}>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
        </svg>
      );

    case "phone_number":
      return (
        <svg {...commonProps}>
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <path d="M10 5h4" />
          <path d="M11 18h2" />
        </svg>
      );
  }
}

export function CategoryManager({
  initialCategories,
  productCounts,
}: CategoryManagerProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>(
    sortCategories(initialCategories),
  );

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);

  const [formError, setFormError] = useState("");

  const [formSuccess, setFormSuccess] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteError, setDeleteError] = useState("");

  const filteredCategories = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return categories.filter((category) => {
      if (statusFilter && category.status !== statusFilter) {
        return false;
      }

      if (normalizedSearch) {
        const searchableText = normalizeSearch(
          [
            category.name,
            category.slug,
            category.description,
            CATEGORY_TYPE_LABELS[category.type],
          ].join(" "),
        );

        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [categories, search, statusFilter]);

  const activeCategoryCount = categories.filter(
    (category) => category.status === "active",
  ).length;

  const inactiveCategoryCount = categories.length - activeCategoryCount;

  const totalProducts = Object.values(productCounts).reduce(
    (total, count) => total + count,
    0,
  );

  useEffect(() => {
    if (!isFormModalOpen && !categoryToDelete) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (!isSubmitting && !isDeleting) {
        setIsFormModalOpen(false);
        setCategoryToDelete(null);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isFormModalOpen, categoryToDelete, isSubmitting, isDeleting]);

  function resetFilters() {
    setSearch("");
    setStatusFilter("");
  }

  function openCreateModal() {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormSuccess("");
    setIsFormModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);

    setForm({
      name: category.name,
      type: category.type,

      description: category.description,

      status: category.status,

      order: String(category.order),
    });

    setFormError("");
    setFormSuccess("");
    setIsFormModalOpen(true);
  }

  function closeFormModal() {
    if (isSubmitting) {
      return;
    }

    setIsFormModalOpen(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormSuccess("");
  }

  function updateForm<Key extends keyof CategoryFormState>(
    key: Key,
    value: CategoryFormState[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function validateForm(): string | null {
    if (form.name.trim().length < 3) {
      return "Nama kategori minimal 3 karakter.";
    }

    if (form.description.trim().length < 10) {
      return "Deskripsi kategori minimal 10 karakter.";
    }

    const order = Number(form.order || 0);

    if (!Number.isInteger(order) || order < 0 || order > 9999) {
      return "Urutan kategori harus berupa angka antara 0 sampai 9999.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setFormError("");
    setFormSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);

      return;
    }

    setIsSubmitting(true);

    try {
      const commonPayload = {
        name: form.name.trim(),

        description: form.description.trim(),

        status: form.status,

        order: Number(form.order || 0),
      };

      const payload = editingCategory
        ? commonPayload
        : {
            ...commonPayload,
            type: form.type,
          };

      const endpoint = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";

      const response = await fetch(endpoint, {
        method: editingCategory ? "PATCH" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),

        credentials: "same-origin",

        cache: "no-store",
      });

      const result = (await response.json()) as ApiResponse<{
        category: Category;
      }>;

      if (!response.ok || !result.success || !result.data?.category) {
        throw new Error(
          getApiErrorMessage(
            result,
            editingCategory
              ? "Kategori gagal diperbarui."
              : "Kategori gagal dibuat.",
          ),
        );
      }

      const savedCategory = result.data.category;

      if (editingCategory) {
        setCategories((currentCategories) =>
          sortCategories(
            currentCategories.map((category) =>
              category.id === savedCategory.id ? savedCategory : category,
            ),
          ),
        );

        setFormSuccess("Kategori berhasil diperbarui.");
      } else {
        setCategories((currentCategories) =>
          sortCategories([...currentCategories, savedCategory]),
        );

        setFormSuccess("Kategori berhasil dibuat.");
      }

      router.refresh();

      window.setTimeout(() => {
        closeFormModal();
      }, 500);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : editingCategory
            ? "Kategori gagal diperbarui."
            : "Kategori gagal dibuat.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function requestDeleteCategory(category: Category) {
    const productCount = productCounts[category.id] ?? 0;

    if (productCount > 0) {
      setDeleteError(
        `Kategori ini masih digunakan oleh ${productCount} produk. Pindahkan atau hapus produknya terlebih dahulu.`,
      );

      setCategoryToDelete(category);

      return;
    }

    setDeleteError("");
    setCategoryToDelete(category);
  }

  async function handleDelete() {
    if (!categoryToDelete || isDeleting) {
      return;
    }

    const productCount = productCounts[categoryToDelete.id] ?? 0;

    if (productCount > 0) {
      setDeleteError(
        `Kategori ini masih digunakan oleh ${productCount} produk dan belum dapat dihapus.`,
      );

      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/categories/${categoryToDelete.id}`,
        {
          method: "DELETE",
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      const result = (await response.json()) as ApiResponse<{
        deleted: boolean;
        categoryId?: string;
      }>;

      if (!response.ok || !result.success) {
        throw new Error(getApiErrorMessage(result, "Kategori gagal dihapus."));
      }

      setCategories((currentCategories) =>
        currentCategories.filter(
          (category) => category.id !== categoryToDelete.id,
        ),
      );

      setCategoryToDelete(null);
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Kategori gagal dihapus.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Total Kategori</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950">
            {categories.length}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Seluruh kelompok produk.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Kategori Aktif</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-emerald-700">
            {activeCategoryCount}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Dapat digunakan produk.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Tidak Aktif</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-amber-700">
            {inactiveCategoryCount}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Tidak menerima publikasi baru.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
          <p className="text-sm font-medium text-neutral-500">Total Produk</p>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-blue-700">
            {totalProducts}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Tersebar dalam kategori.
          </p>
        </article>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm shadow-neutral-950/[0.02]">
        <div className="border-b border-neutral-200 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(220px,1fr)_180px]">
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
                  placeholder="Cari kategori..."
                  className={`${inputClassName} pl-10`}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={inputClassName}
              >
                <option value="">Semua status</option>

                <option value="active">Aktif</option>

                <option value="inactive">Tidak aktif</option>
              </select>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              <span className="text-lg leading-none">+</span>
              Tambah Kategori
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">
              Menampilkan{" "}
              <strong className="font-semibold text-neutral-800">
                {filteredCategories.length}
              </strong>{" "}
              dari{" "}
              <strong className="font-semibold text-neutral-800">
                {categories.length}
              </strong>{" "}
              kategori
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

        {filteredCategories.length === 0 ? (
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
                <rect x="3" y="3" width="7" height="7" rx="2" />

                <rect x="14" y="3" width="7" height="7" rx="2" />

                <rect x="3" y="14" width="7" height="7" rx="2" />

                <path d="M14 17.5h7" />
              </svg>
            </div>

            <h2 className="mt-5 font-semibold text-neutral-900">
              Kategori tidak ditemukan
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Ubah kata pencarian atau filter status yang digunakan.
            </p>

            <button
              type="button"
              onClick={search || statusFilter ? resetFilters : openCreateModal}
              className="mt-5 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {search || statusFilter ? "Tampilkan semua" : "Tambah kategori"}
            </button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[920px] text-left">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/80">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Kategori
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Jenis
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Produk
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Urutan
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((category) => {
                    const productCount = productCounts[category.id] ?? 0;

                    return (
                      <tr
                        key={category.id}
                        className="border-b border-neutral-100 transition last:border-b-0 hover:bg-neutral-50/60"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                              <CategoryTypeIcon type={category.type} />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-neutral-900">
                                {category.name}
                              </p>

                              <p className="mt-1 max-w-[340px] truncate text-xs text-neutral-500">
                                {category.description}
                              </p>

                              <p className="mt-1 text-[11px] text-neutral-400">
                                /{category.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-neutral-700">
                          {CATEGORY_TYPE_LABELS[category.type]}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex min-w-9 items-center justify-center rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
                            {productCount}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-neutral-700">
                          {category.order}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                              category.status === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-neutral-100 text-neutral-600",
                            ].join(" ")}
                          >
                            {category.status === "active"
                              ? "Aktif"
                              : "Tidak aktif"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(category)}
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => requestDeleteCategory(category)}
                              className={[
                                "inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition",
                                productCount > 0
                                  ? "border-neutral-200 text-neutral-400 hover:bg-neutral-50"
                                  : "border-neutral-200 text-neutral-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700",
                              ].join(" ")}
                            >
                              {productCount > 0 ? "Terpakai" : "Hapus"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-neutral-100 lg:hidden">
              {filteredCategories.map((category) => {
                const productCount = productCounts[category.id] ?? 0;

                return (
                  <article key={category.id} className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                        <CategoryTypeIcon type={category.type} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-neutral-900">
                            {category.name}
                          </h2>

                          <span
                            className={[
                              "rounded-full px-2 py-1 text-[10px] font-semibold",
                              category.status === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-neutral-100 text-neutral-600",
                            ].join(" ")}
                          >
                            {category.status === "active"
                              ? "Aktif"
                              : "Tidak aktif"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-neutral-500">
                          {CATEGORY_TYPE_LABELS[category.type]}
                        </p>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                        <p className="text-[11px] text-neutral-500">Produk</p>

                        <p className="mt-1 text-sm font-semibold text-neutral-900">
                          {productCount}
                        </p>
                      </div>

                      <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                        <p className="text-[11px] text-neutral-500">Urutan</p>

                        <p className="mt-1 text-sm font-semibold text-neutral-900">
                          {category.order}
                        </p>
                      </div>

                      <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                        <p className="text-[11px] text-neutral-500">Slug</p>

                        <p className="mt-1 truncate text-xs font-semibold text-neutral-800">
                          {category.slug}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(category)}
                        className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => requestDeleteCategory(category)}
                        className={[
                          "rounded-lg border px-3 py-2 text-xs font-semibold transition",
                          productCount > 0
                            ? "border-neutral-200 text-neutral-400"
                            : "border-red-200 text-red-700 hover:bg-red-50",
                        ].join(" ")}
                      >
                        {productCount > 0 ? "Masih dipakai" : "Hapus"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {isFormModalOpen ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-neutral-950/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) {
              closeFormModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
            className="my-auto w-full max-w-xl rounded-2xl border border-neutral-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Katalog
                </p>

                <h2
                  id="category-form-title"
                  className="mt-2 text-xl font-semibold tracking-tight text-neutral-950"
                >
                  {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
                </h2>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  {editingCategory
                    ? "Perbarui informasi dan status kategori."
                    : "Buat kelompok baru untuk produk digital."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
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

              {formSuccess ? (
                <div
                  role="status"
                  className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
                >
                  {formSuccess}
                </div>
              ) : null}

              <div className="grid gap-5">
                <div>
                  <label
                    htmlFor="category-name"
                    className="text-sm font-semibold text-neutral-800"
                  >
                    Nama kategori
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="category-name"
                    type="text"
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder="Contoh: Top Up Game"
                    maxLength={100}
                    className={`${inputClassName} mt-2`}
                  />

                  {editingCategory ? (
                    <p className="mt-2 text-xs leading-5 text-neutral-500">
                      Slug kategori tetap{" "}
                      <strong className="font-semibold text-neutral-700">
                        {editingCategory.slug}
                      </strong>{" "}
                      agar relasi produk tidak berubah.
                    </p>
                  ) : (
                    <p className="mt-2 text-xs leading-5 text-neutral-500">
                      Slug akan dibuat otomatis dari nama kategori.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="category-type"
                    className="text-sm font-semibold text-neutral-800"
                  >
                    Jenis kategori
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <select
                    id="category-type"
                    value={form.type}
                    disabled={Boolean(editingCategory)}
                    onChange={(event) =>
                      updateForm("type", event.target.value as CategoryType)
                    }
                    className={`${inputClassName} mt-2`}
                  >
                    {Object.entries(CATEGORY_TYPE_LABELS).map(
                      ([type, label]) => (
                        <option key={type} value={type}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>

                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    {CATEGORY_TYPE_DESCRIPTIONS[form.type]}
                  </p>

                  {editingCategory ? (
                    <p className="mt-2 text-xs font-medium text-amber-700">
                      Jenis kategori tidak dapat diganti setelah kategori
                      dibuat.
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="category-description"
                    className="text-sm font-semibold text-neutral-800"
                  >
                    Deskripsi kategori
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <textarea
                    id="category-description"
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    placeholder="Jelaskan produk apa saja yang masuk dalam kategori ini."
                    rows={4}
                    maxLength={500}
                    className={`${textareaClassName} mt-2`}
                  />

                  <div className="mt-2 flex justify-end">
                    <span className="text-xs text-neutral-400">
                      {form.description.length}
                      /500
                    </span>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="category-status"
                      className="text-sm font-semibold text-neutral-800"
                    >
                      Status
                    </label>

                    <select
                      id="category-status"
                      value={form.status}
                      onChange={(event) =>
                        updateForm(
                          "status",
                          event.target.value as CategoryStatus,
                        )
                      }
                      className={`${inputClassName} mt-2`}
                    >
                      <option value="active">Aktif</option>

                      <option value="inactive">Tidak aktif</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="category-order"
                      className="text-sm font-semibold text-neutral-800"
                    >
                      Urutan tampilan
                    </label>

                    <input
                      id="category-order"
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
                      Angka kecil tampil lebih awal.
                    </p>
                  </div>
                </div>

                <div
                  className={[
                    "rounded-xl border px-4 py-3",
                    form.status === "active"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-amber-200 bg-amber-50",
                  ].join(" ")}
                >
                  <p
                    className={[
                      "text-sm font-semibold",
                      form.status === "active"
                        ? "text-emerald-800"
                        : "text-amber-800",
                    ].join(" ")}
                  >
                    {form.status === "active"
                      ? "Kategori aktif"
                      : "Kategori tidak aktif"}
                  </p>

                  <p
                    className={[
                      "mt-1 text-xs leading-5",
                      form.status === "active"
                        ? "text-emerald-700"
                        : "text-amber-700",
                    ].join(" ")}
                  >
                    {form.status === "active"
                      ? "Kategori dapat digunakan ketika membuat dan memublikasikan produk."
                      : "Produk lama tetap tersimpan, tetapi produk tidak dapat dipublikasikan menggunakan kategori ini."}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
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
                    ? editingCategory
                      ? "Menyimpan..."
                      : "Membuat..."
                    : editingCategory
                      ? "Simpan Perubahan"
                      : "Buat Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {categoryToDelete ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setCategoryToDelete(null);

              setDeleteError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl sm:p-6"
          >
            <div
              className={[
                "flex size-11 items-center justify-center rounded-xl",
                (productCounts[categoryToDelete.id] ?? 0) > 0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-600",
              ].join(" ")}
            >
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
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.9 2.5 18a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>

            <h2
              id="delete-category-title"
              className="mt-5 text-lg font-semibold text-neutral-950"
            >
              {(productCounts[categoryToDelete.id] ?? 0) > 0
                ? "Kategori masih digunakan"
                : "Hapus kategori?"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {(productCounts[categoryToDelete.id] ?? 0) > 0 ? (
                <>
                  Kategori{" "}
                  <strong className="font-semibold text-neutral-900">
                    {categoryToDelete.name}
                  </strong>{" "}
                  masih memiliki produk dan belum dapat dihapus.
                </>
              ) : (
                <>
                  Kategori{" "}
                  <strong className="font-semibold text-neutral-900">
                    {categoryToDelete.name}
                  </strong>{" "}
                  akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                </>
              )}
            </p>

            {deleteError ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-6 text-amber-800">
                {deleteError}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setCategoryToDelete(null);

                  setDeleteError("");
                }}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
              >
                {(productCounts[categoryToDelete.id] ?? 0) > 0
                  ? "Tutup"
                  : "Batal"}
              </button>

              {(productCounts[categoryToDelete.id] ?? 0) === 0 ? (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? "Menghapus..." : "Hapus permanen"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
