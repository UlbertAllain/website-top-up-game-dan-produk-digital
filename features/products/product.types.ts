import type { CategoryType } from "@/features/categories/category.types";

export const PRODUCT_PUBLICATION_STATUSES = [
  "draft",
  "published",
  "hidden",
] as const;

export const PRODUCT_STOCK_STATUSES = [
  "available",
  "limited",
  "unavailable",
] as const;

export type ProductType = CategoryType;

export type ProductPublicationStatus =
  (typeof PRODUCT_PUBLICATION_STATUSES)[number];

export type ProductStockStatus = (typeof PRODUCT_STOCK_STATUSES)[number];

export type ProductMedia = {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  alt: string;
};

export type TopUpSpecifications = {
  gameName: string;
  nominal: string;
  gameCurrency: string;
  estimatedProcess: string;
};

export type GameAccountSpecifications = {
  gameName: string;
  rank: string;
  level: string;
  region: string;
  skinCount: string;
  loginMethod: string;
  warranty: string;
};

export type SubscriptionSpecifications = {
  applicationName: string;
  planName: string;
  duration: string;
  accessType: string;
  activationMethod: string;
  warranty: string;
};

export type PhoneNumberSpecifications = {
  country: string;
  provider: string;
  numberType: string;
  activePeriod: string;
  estimatedProcess: string;
};

export type ProductSpecifications =
  | TopUpSpecifications
  | GameAccountSpecifications
  | SubscriptionSpecifications
  | PhoneNumberSpecifications;

export type Product = {
  id: string;
  code: string;
  name: string;
  slug: string;
  categoryId: string;
  type: ProductType;

  shortDescription: string;
  description: string;

  price: number;
  discountPrice: number | null;

  publicationStatus: ProductPublicationStatus;
  stockStatus: ProductStockStatus;

  isFeatured: boolean;
  order: number;

  thumbnail: ProductMedia | null;
  gallery: ProductMedia[];

  whatsappMessage: string;
  specifications: ProductSpecifications;

  createdAt: string;
  updatedAt: string;
};

export type NewProductRecord = Omit<Product, "createdAt" | "updatedAt">;

export type UpdateProductRecord = Partial<
  Pick<
    Product,
    | "name"
    | "shortDescription"
    | "description"
    | "price"
    | "discountPrice"
    | "publicationStatus"
    | "stockStatus"
    | "isFeatured"
    | "order"
    | "whatsappMessage"
    | "specifications"
    | "thumbnail"
    | "gallery"
  >
>;

export type ProductFilters = {
  categoryId?: string;
  type?: ProductType;
  publicationStatus?: ProductPublicationStatus;
  stockStatus?: ProductStockStatus;
  isFeatured?: boolean;
  search?: string;
};
