export const CATEGORY_TYPES = [
  "top_up",
  "game_account",
  "subscription",
  "phone_number",
] as const;

export const CATEGORY_STATUSES = ["active", "inactive"] as const;

export type CategoryType = (typeof CATEGORY_TYPES)[number];

export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export type Category = {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description: string;
  status: CategoryStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type NewCategoryRecord = {
  name: string;
  slug: string;
  type: CategoryType;
  description: string;
  status: CategoryStatus;
  order: number;
};

export type UpdateCategoryRecord = Partial<
  Pick<Category, "name" | "description" | "status" | "order">
>;

export type CategoryFilters = {
  type?: CategoryType;
  status?: CategoryStatus;
};
