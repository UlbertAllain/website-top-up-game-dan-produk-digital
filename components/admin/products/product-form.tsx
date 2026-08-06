"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Category } from "@/features/categories/category.types";
import type {
  Product,
  ProductPublicationStatus,
  ProductStockStatus,
  ProductType,
} from "@/features/products/product.types";

type ProductFormProps = {
  mode: "create" | "edit";
  categories: Category[];
  product?: Product;
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

type ProductFormState = {
  name: string;
  categoryId: string;
  shortDescription: string;
  description: string;

  price: string;
  discountPrice: string;

  publicationStatus: ProductPublicationStatus;

  stockStatus: ProductStockStatus;

  isFeatured: boolean;
  order: string;
  whatsappMessage: string;

  specifications: Record<string, string>;
};

type SpecificationField = {
  key: string;
  label: string;
  placeholder: string;
  help?: string;
};

const specificationFields: Record<ProductType, SpecificationField[]> = {
  top_up: [
    {
      key: "gameName",
      label: "Nama game",
      placeholder: "Contoh: Mobile Legends",
    },
    {
      key: "nominal",
      label: "Nominal produk",
      placeholder: "Contoh: 86 Diamonds",
    },
    {
      key: "gameCurrency",
      label: "Mata uang game",
      placeholder: "Contoh: Diamond",
    },
    {
      key: "estimatedProcess",
      label: "Estimasi proses",
      placeholder: "Contoh: 5–15 menit",
    },
  ],

  game_account: [
    {
      key: "gameName",
      label: "Nama game",
      placeholder: "Contoh: Mobile Legends",
    },
    {
      key: "rank",
      label: "Rank akun",
      placeholder: "Contoh: Mythic",
    },
    {
      key: "level",
      label: "Level akun",
      placeholder: "Contoh: 85",
    },
    {
      key: "region",
      label: "Region",
      placeholder: "Contoh: Indonesia",
    },
    {
      key: "skinCount",
      label: "Jumlah skin",
      placeholder: "Contoh: 120+ Skin",
    },
    {
      key: "loginMethod",
      label: "Metode login",
      placeholder: "Contoh: Moonton",
    },
    {
      key: "warranty",
      label: "Garansi",
      placeholder: "Contoh: Garansi 7 hari",
    },
  ],

  subscription: [
    {
      key: "applicationName",
      label: "Nama aplikasi",
      placeholder: "Contoh: Canva",
    },
    {
      key: "planName",
      label: "Nama paket",
      placeholder: "Contoh: Canva Pro",
    },
    {
      key: "duration",
      label: "Durasi",
      placeholder: "Contoh: 1 Bulan",
    },
    {
      key: "accessType",
      label: "Jenis akses",
      placeholder: "Contoh: Aktivasi email pribadi",
    },
    {
      key: "activationMethod",
      label: "Metode aktivasi",
      placeholder: "Contoh: Undangan melalui email",
    },
    {
      key: "warranty",
      label: "Garansi",
      placeholder: "Contoh: Garansi selama masa aktif",
    },
  ],

  phone_number: [
    {
      key: "country",
      label: "Negara",
      placeholder: "Contoh: Indonesia",
    },
    {
      key: "provider",
      label: "Provider",
      placeholder: "Contoh: Telkomsel",
    },
    {
      key: "numberType",
      label: "Jenis nomor",
      placeholder: "Contoh: Nomor kosong",
    },
    {
      key: "activePeriod",
      label: "Masa aktif",
      placeholder: "Contoh: Sesuai informasi admin",
    },
    {
      key: "estimatedProcess",
      label: "Estimasi proses",
      placeholder: "Contoh: 5–30 menit",
    },
  ],
};

const productTypeLabels: Record<ProductType, string> = {
  top_up: "Top Up Game",
  game_account: "Akun Game",
  subscription: "Subscription",
  phone_number: "Nomor Kosong",
};

const inputClassName =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500";

const textareaClassName =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-neutral-100";

function FormField({
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
      <div className="mb-2">
        <p className="text-sm font-semibold text-neutral-800">
          {label}

          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </p>

        {description ? (
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </div>
  );
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

function formatNumericInput(value: string): string {
  if (!value) {
    return "";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value;
  }

  return number.toLocaleString("id-ID");
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function createEmptySpecifications(type: ProductType): Record<string, string> {
  return Object.fromEntries(
    specificationFields[type].map((field) => [field.key, ""]),
  );
}

function getProductSpecifications(product: Product): Record<string, string> {
  const specifications = product.specifications as unknown as Record<
    string,
    unknown
  >;

  return Object.fromEntries(
    Object.entries(specifications).map(([key, value]) => [
      key,
      String(value ?? ""),
    ]),
  );
}

function createInitialState(
  categories: Category[],
  product?: Product,
): ProductFormState {
  if (product) {
    return {
      name: product.name,
      categoryId: product.categoryId,

      shortDescription: product.shortDescription,

      description: product.description,

      price: String(product.price),

      discountPrice:
        product.discountPrice !== null ? String(product.discountPrice) : "",

      publicationStatus: product.publicationStatus,

      stockStatus: product.stockStatus,

      isFeatured: product.isFeatured,

      order: String(product.order),

      whatsappMessage: product.whatsappMessage,

      specifications: getProductSpecifications(product),
    };
  }

  const firstActiveCategory = categories.find(
    (category) => category.status === "active",
  );

  return {
    name: "",

    categoryId: firstActiveCategory?.id ?? "",

    shortDescription: "",
    description: "",

    price: "",
    discountPrice: "",

    publicationStatus: "draft",
    stockStatus: "available",

    isFeatured: false,
    order: "0",

    whatsappMessage: "",

    specifications: firstActiveCategory
      ? createEmptySpecifications(firstActiveCategory.type)
      : {},
  };
}

function getApiErrorMessage(
  response: ApiResponse<unknown>,
  fallback: string,
): string {
  if (response.error?.message) {
    return response.error.message;
  }

  const fieldErrors = response.error?.fields;

  if (fieldErrors) {
    const firstError = Object.values(fieldErrors).flat()[0];

    if (firstError) {
      return firstError;
    }
  }

  return fallback;
}

export function ProductForm({ mode, categories, product }: ProductFormProps) {
  const router = useRouter();

  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductFormState>(() =>
    createInitialState(categories, product),
  );

  const [currentProduct, setCurrentProduct] = useState<Product | null>(
    product ?? null,
  );

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isMediaBusy, setIsMediaBusy] = useState(false);

  const selectedCategory = useMemo(
    () =>
      categories.find((category) => category.id === form.categoryId) ?? null,
    [categories, form.categoryId],
  );

  const selectedType = currentProduct?.type ?? selectedCategory?.type ?? null;

  const fields = selectedType ? specificationFields[selectedType] : [];

  const normalPrice = Number(form.price || 0);

  const discountPrice = form.discountPrice ? Number(form.discountPrice) : null;

  const finalPrice = discountPrice ?? normalPrice;

  const currentGalleryCount = currentProduct?.gallery.length ?? 0;

  const remainingGallerySlots = Math.max(
    0,
    8 - currentGalleryCount - galleryFiles.length,
  );

  function updateField<Key extends keyof ProductFormState>(
    key: Key,
    value: ProductFormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleCategoryChange(categoryId: string) {
    const category = categories.find((item) => item.id === categoryId);

    setForm((current) => ({
      ...current,
      categoryId,

      specifications: category ? createEmptySpecifications(category.type) : {},
    }));
  }

  function updateSpecification(key: string, value: string) {
    setForm((current) => ({
      ...current,

      specifications: {
        ...current.specifications,
        [key]: value,
      },
    }));
  }

  function handleGallerySelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      setGalleryFiles([]);
      return;
    }

    const availableSlots = Math.max(0, 8 - currentGalleryCount);

    if (files.length > availableSlots) {
      setError(
        `Galeri maksimal 8 gambar. Kamu hanya dapat memilih ${availableSlots} gambar lagi.`,
      );

      event.target.value = "";
      return;
    }

    setError("");
    setGalleryFiles(files);
  }

  function validateForm(): string | null {
    if (!form.name.trim()) {
      return "Nama produk wajib diisi.";
    }

    if (!form.categoryId) {
      return "Kategori produk wajib dipilih.";
    }

    if (!form.shortDescription.trim()) {
      return "Deskripsi singkat wajib diisi.";
    }

    if (!form.description.trim()) {
      return "Deskripsi lengkap wajib diisi.";
    }

    if (!form.price) {
      return "Harga normal wajib diisi.";
    }

    if (normalPrice < 0 || !Number.isInteger(normalPrice)) {
      return "Harga normal tidak valid.";
    }

    if (discountPrice !== null && discountPrice >= normalPrice) {
      return "Harga promo harus lebih kecil dari harga normal.";
    }

    for (const field of fields) {
      if (!form.specifications[field.key]?.trim()) {
        return `${field.label} wajib diisi.`;
      }
    }

    return null;
  }

  async function uploadThumbnail(
    productId: string,
    file: File,
  ): Promise<Product> {
    const formData = new FormData();

    formData.append("file", file);

    formData.append("alt", `Gambar ${form.name.trim()}`);

    const response = await fetch(`/api/admin/products/${productId}/thumbnail`, {
      method: "POST",
      body: formData,
      credentials: "same-origin",
      cache: "no-store",
    });

    const result = (await response.json()) as ApiResponse<{
      product: Product;
    }>;

    if (!response.ok || !result.success || !result.data?.product) {
      throw new Error(getApiErrorMessage(result, "Thumbnail gagal diunggah."));
    }

    return result.data.product;
  }

  async function uploadGalleryImage(
    productId: string,
    file: File,
  ): Promise<Product> {
    const formData = new FormData();

    formData.append("file", file);

    formData.append("alt", `Galeri ${form.name.trim()}`);

    const response = await fetch(`/api/admin/products/${productId}/gallery`, {
      method: "POST",
      body: formData,
      credentials: "same-origin",
      cache: "no-store",
    });

    const result = (await response.json()) as ApiResponse<{
      product: Product;
    }>;

    if (!response.ok || !result.success || !result.data?.product) {
      throw new Error(
        getApiErrorMessage(result, "Gambar galeri gagal diunggah."),
      );
    }

    return result.data.product;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || isMediaBusy) {
      return;
    }

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    let savedProduct: Product | null = null;

    try {
      const commonPayload = {
        name: form.name.trim(),

        shortDescription: form.shortDescription.trim(),

        description: form.description.trim(),

        price: normalPrice,

        discountPrice,

        publicationStatus: form.publicationStatus,

        stockStatus: form.stockStatus,

        isFeatured: form.isFeatured,

        order: Number(form.order || 0),

        whatsappMessage: form.whatsappMessage.trim(),

        specifications: form.specifications,
      };

      const payload =
        mode === "create"
          ? {
              ...commonPayload,

              categoryId: form.categoryId,
            }
          : commonPayload;

      const endpoint =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${product?.id}`;

      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),

        credentials: "same-origin",

        cache: "no-store",
      });

      const result = (await response.json()) as ApiResponse<{
        product: Product;
      }>;

      if (!response.ok || !result.success || !result.data?.product) {
        throw new Error(
          getApiErrorMessage(
            result,
            mode === "create"
              ? "Produk gagal dibuat."
              : "Produk gagal diperbarui.",
          ),
        );
      }

      savedProduct = result.data.product;

      let latestProduct = savedProduct;

      let mediaUploadFailed = false;

      try {
        if (thumbnailFile) {
          latestProduct = await uploadThumbnail(savedProduct.id, thumbnailFile);
        }

        for (const file of galleryFiles) {
          latestProduct = await uploadGalleryImage(savedProduct.id, file);
        }
      } catch (mediaError) {
        mediaUploadFailed = true;

        setError(
          mediaError instanceof Error
            ? `Data produk sudah tersimpan, tetapi media gagal diproses: ${mediaError.message}`
            : "Data produk sudah tersimpan, tetapi media gagal diproses.",
        );
      }

      setCurrentProduct(latestProduct);

      setThumbnailFile(null);
      setGalleryFiles([]);

      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }

      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }

      if (mode === "create") {
        const query = mediaUploadFailed
          ? "?created=1&media=partial"
          : "?created=1";

        router.replace(`/admin/products/${savedProduct.id}/edit${query}`);

        router.refresh();
        return;
      }

      if (!mediaUploadFailed) {
        setSuccess("Perubahan produk berhasil disimpan.");
      }

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : mode === "create"
            ? "Produk gagal dibuat."
            : "Produk gagal diperbarui.",
      );

      if (mode === "create" && savedProduct) {
        router.replace(
          `/admin/products/${savedProduct.id}/edit?created=1&media=partial`,
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteThumbnail() {
    if (!currentProduct?.thumbnail || isMediaBusy) {
      return;
    }

    const confirmed = window.confirm("Hapus thumbnail produk ini?");

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setIsMediaBusy(true);

    try {
      const response = await fetch(
        `/api/admin/products/${currentProduct.id}/thumbnail`,
        {
          method: "DELETE",
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      const result = (await response.json()) as ApiResponse<{
        product: Product;
      }>;

      if (!response.ok || !result.success || !result.data?.product) {
        throw new Error(getApiErrorMessage(result, "Thumbnail gagal dihapus."));
      }

      setCurrentProduct(result.data.product);

      setSuccess("Thumbnail berhasil dihapus.");

      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Thumbnail gagal dihapus.",
      );
    } finally {
      setIsMediaBusy(false);
    }
  }

  async function handleDeleteGalleryImage(publicId: string) {
    if (!currentProduct || isMediaBusy) {
      return;
    }

    const confirmed = window.confirm("Hapus gambar dari galeri?");

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setIsMediaBusy(true);

    try {
      const response = await fetch(
        `/api/admin/products/${currentProduct.id}/gallery`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            publicId,
          }),

          credentials: "same-origin",

          cache: "no-store",
        },
      );

      const result = (await response.json()) as ApiResponse<{
        product: Product;
      }>;

      if (!response.ok || !result.success || !result.data?.product) {
        throw new Error(
          getApiErrorMessage(result, "Gambar galeri gagal dihapus."),
        );
      }

      setCurrentProduct(result.data.product);

      setSuccess("Gambar galeri berhasil dihapus.");

      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Gambar galeri gagal dihapus.",
      );
    } finally {
      setIsMediaBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      {error ? (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
        >
          {success}
        </div>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02] sm:p-6">
            <div className="border-b border-neutral-100 pb-5">
              <h2 className="font-semibold text-neutral-950">
                Informasi dasar
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Informasi utama yang akan dibaca pengunjung pada katalog.
              </p>
            </div>

            <div className="mt-5 grid gap-5">
              <FormField label="Nama produk" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Contoh: Mobile Legends 86 Diamonds"
                  maxLength={160}
                  className={inputClassName}
                />
              </FormField>

              <FormField
                label="Kategori"
                required
                description={
                  mode === "edit"
                    ? "Kategori tidak dapat diganti setelah produk dibuat."
                    : "Kategori menentukan form spesifikasi produk."
                }
              >
                <select
                  value={form.categoryId}
                  disabled={mode === "edit"}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                  className={inputClassName}
                >
                  <option value="">Pilih kategori</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      disabled={
                        mode === "create" && category.status !== "active"
                      }
                    >
                      {category.name}
                      {category.status !== "active" ? " — Tidak aktif" : ""}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Deskripsi singkat"
                required
                description="Tampil pada card produk dan ringkasan katalog."
              >
                <textarea
                  value={form.shortDescription}
                  onChange={(event) =>
                    updateField("shortDescription", event.target.value)
                  }
                  placeholder="Jelaskan produk secara singkat dan mudah dipahami."
                  rows={3}
                  maxLength={300}
                  className={textareaClassName}
                />
              </FormField>

              <FormField
                label="Deskripsi lengkap"
                required
                description="Berikan informasi proses, kebutuhan pelanggan, dan ketentuan produk."
              >
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Tuliskan detail produk secara lengkap."
                  rows={7}
                  maxLength={6000}
                  className={textareaClassName}
                />
              </FormField>

              <FormField
                label="Pesan WhatsApp khusus"
                description="Opsional. Kosongkan untuk menggunakan template WhatsApp utama."
              >
                <textarea
                  value={form.whatsappMessage}
                  onChange={(event) =>
                    updateField("whatsappMessage", event.target.value)
                  }
                  placeholder="Contoh: Halo Admin, saya tertarik dengan {productName}..."
                  rows={4}
                  maxLength={1500}
                  className={textareaClassName}
                />
              </FormField>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02] sm:p-6">
            <div className="border-b border-neutral-100 pb-5">
              <h2 className="font-semibold text-neutral-950">Harga produk</h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Gunakan angka tanpa mengetik simbol Rupiah.
              </p>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <FormField label="Harga normal" required>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">
                    Rp
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatNumericInput(form.price)}
                    onChange={(event) =>
                      updateField("price", onlyDigits(event.target.value))
                    }
                    placeholder="0"
                    className={`${inputClassName} pl-10`}
                  />
                </div>
              </FormField>

              <FormField
                label="Harga promo"
                description="Opsional dan harus lebih kecil dari harga normal."
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">
                    Rp
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatNumericInput(form.discountPrice)}
                    onChange={(event) =>
                      updateField(
                        "discountPrice",
                        onlyDigits(event.target.value),
                      )
                    }
                    placeholder="Kosongkan jika tidak promo"
                    className={`${inputClassName} pl-10`}
                  />
                </div>
              </FormField>
            </div>

            <div className="mt-5 rounded-xl bg-neutral-50 px-4 py-3">
              <p className="text-xs text-neutral-500">
                Harga yang tampil di katalog
              </p>

              <p className="mt-1 text-lg font-semibold text-neutral-950">
                {formatRupiah(finalPrice)}
              </p>

              {discountPrice !== null && normalPrice > 0 ? (
                <p className="mt-1 text-xs text-neutral-400 line-through">
                  {formatRupiah(normalPrice)}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02] sm:p-6">
            <div className="border-b border-neutral-100 pb-5">
              <h2 className="font-semibold text-neutral-950">
                Spesifikasi produk
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                {selectedType
                  ? `Form spesifikasi untuk ${productTypeLabels[selectedType]}.`
                  : "Pilih kategori untuk menampilkan spesifikasi."}
              </p>
            </div>

            {fields.length > 0 ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {fields.map((field) => (
                  <FormField
                    key={field.key}
                    label={field.label}
                    required
                    description={field.help}
                  >
                    <input
                      type="text"
                      value={form.specifications[field.key] ?? ""}
                      onChange={(event) =>
                        updateSpecification(field.key, event.target.value)
                      }
                      placeholder={field.placeholder}
                      maxLength={200}
                      className={inputClassName}
                    />
                  </FormField>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-10 text-center text-sm text-neutral-500">
                Pilih kategori produk terlebih dahulu.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02] sm:p-6">
            <div className="border-b border-neutral-100 pb-5">
              <h2 className="font-semibold text-neutral-950">Media produk</h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Format JPG, PNG, atau WebP dengan ukuran maksimal 5 MB per
                gambar.
              </p>
            </div>

            <div className="mt-5">
              <FormField
                label="Thumbnail utama"
                description="Digunakan sebagai gambar utama pada daftar produk."
              >
                {currentProduct?.thumbnail ? (
                  <div className="mb-4 flex items-center gap-4 rounded-xl border border-neutral-200 p-3">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                      <Image
                        src={currentProduct.thumbnail.secureUrl}
                        alt={
                          currentProduct.thumbnail.alt || currentProduct.name
                        }
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-800">
                        Thumbnail saat ini
                      </p>

                      <p className="mt-1 truncate text-xs text-neutral-500">
                        {currentProduct.thumbnail.publicId}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isMediaBusy}
                      onClick={handleDeleteThumbnail}
                      className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      Hapus
                    </button>
                  </div>
                ) : null}

                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setThumbnailFile(event.target.files?.[0] ?? null)
                  }
                  className="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-neutral-700 hover:file:bg-neutral-200"
                />

                {thumbnailFile ? (
                  <p className="mt-2 text-xs text-blue-600">
                    Gambar terpilih: {thumbnailFile.name}
                  </p>
                ) : null}
              </FormField>
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-6">
              <FormField
                label="Galeri produk"
                description={`Maksimal 8 gambar. Tersisa ${remainingGallerySlots} slot.`}
              >
                {currentProduct && currentProduct.gallery.length > 0 ? (
                  <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {currentProduct.gallery.map((image) => (
                      <div
                        key={image.publicId}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
                      >
                        <Image
                          src={image.secureUrl}
                          alt={image.alt || currentProduct.name}
                          fill
                          sizes="180px"
                          className="object-cover"
                        />

                        <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-neutral-950/70 to-transparent p-2 pt-8">
                          <button
                            type="button"
                            disabled={isMediaBusy}
                            onClick={() =>
                              handleDeleteGalleryImage(image.publicId)
                            }
                            className="rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 shadow-sm transition hover:bg-white disabled:opacity-60"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  disabled={currentGalleryCount >= 8}
                  onChange={handleGallerySelection}
                  className="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-neutral-700 hover:file:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-100"
                />

                {galleryFiles.length > 0 ? (
                  <div className="mt-3 rounded-xl bg-blue-50 px-3.5 py-3">
                    <p className="text-xs font-semibold text-blue-800">
                      {galleryFiles.length} gambar dipilih
                    </p>

                    <div className="mt-2 space-y-1">
                      {galleryFiles.map((file) => (
                        <p
                          key={`${file.name}-${file.lastModified}`}
                          className="truncate text-xs text-blue-700"
                        >
                          {file.name}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </FormField>
            </div>

            {mode === "create" ? (
              <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
                Produk akan dibuat terlebih dahulu, kemudian gambar yang dipilih
                otomatis diunggah.
              </div>
            ) : null}
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
            <h2 className="font-semibold text-neutral-950">Status produk</h2>

            <div className="mt-5 space-y-5">
              <FormField label="Publikasi" required>
                <select
                  value={form.publicationStatus}
                  onChange={(event) =>
                    updateField(
                      "publicationStatus",
                      event.target.value as ProductPublicationStatus,
                    )
                  }
                  className={inputClassName}
                >
                  <option value="draft">Draft</option>

                  <option value="published">Dipublikasikan</option>

                  <option value="hidden">Disembunyikan</option>
                </select>
              </FormField>

              <FormField label="Ketersediaan" required>
                <select
                  value={form.stockStatus}
                  onChange={(event) =>
                    updateField(
                      "stockStatus",
                      event.target.value as ProductStockStatus,
                    )
                  }
                  className={inputClassName}
                >
                  <option value="available">Tersedia</option>

                  <option value="limited">Terbatas</option>

                  <option value="unavailable">Tidak tersedia</option>
                </select>
              </FormField>

              <FormField
                label="Urutan tampilan"
                description="Angka lebih kecil ditampilkan lebih awal."
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.order}
                  onChange={(event) =>
                    updateField("order", onlyDigits(event.target.value))
                  }
                  placeholder="0"
                  className={inputClassName}
                />
              </FormField>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-3.5 transition hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    updateField("isFeatured", event.target.checked)
                  }
                  className="mt-0.5 size-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />

                <span>
                  <span className="block text-sm font-semibold text-neutral-800">
                    Produk unggulan
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-neutral-500">
                    Produk dapat ditampilkan pada bagian rekomendasi utama.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {currentProduct ? (
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Informasi sistem
              </p>

              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-xs text-neutral-500">Kode produk</dt>

                  <dd className="mt-1 text-sm font-semibold text-neutral-900">
                    {currentProduct.code}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-neutral-500">Jenis produk</dt>

                  <dd className="mt-1 text-sm font-semibold text-neutral-900">
                    {productTypeLabels[currentProduct.type]}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-neutral-500">Slug</dt>

                  <dd className="mt-1 break-all text-sm text-neutral-700">
                    {currentProduct.slug}
                  </dd>
                </div>
              </dl>
            </section>
          ) : null}

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
            <button
              type="submit"
              disabled={isSubmitting || isMediaBusy}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? mode === "create"
                  ? "Membuat produk..."
                  : "Menyimpan..."
                : mode === "create"
                  ? "Buat Produk"
                  : "Simpan Perubahan"}
            </button>

            <button
              type="button"
              disabled={isSubmitting || isMediaBusy}
              onClick={() => router.push("/admin/products")}
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
            >
              Kembali ke daftar
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-neutral-500">
              Periksa kembali harga, spesifikasi, dan status sebelum menyimpan.
            </p>
          </section>
        </aside>
      </div>
    </form>
  );
}
