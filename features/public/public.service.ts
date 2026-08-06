import "server-only";

import type { Category } from "@/features/categories/category.types";
import { listCategories } from "@/features/categories/category.service";
import type {
  BannerContentData,
  ContentItem,
  ContentPage,
  ContentPageSlug,
  FaqContentData,
  TestimonialContentData,
} from "@/features/content/content.types";
import {
  listContentItems,
  listContentPages,
} from "@/features/content/content.service";
import type { Product } from "@/features/products/product.types";
import { listProducts } from "@/features/products/product.service";
import type { SiteSettings } from "@/features/settings/settings.types";
import { getSiteSettings } from "@/features/settings/settings.service";

export type PublicHomeData = {
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  heroBanner: ContentItem | null;
  testimonials: ContentItem[];
  faqs: ContentItem[];
};

function sortByOrder<
  Item extends {
    order: number;
  },
>(items: Item[]): Item[] {
  return [...items].sort(
    (firstItem, secondItem) => firstItem.order - secondItem.order,
  );
}

function getBannerData(item: ContentItem): BannerContentData {
  return item.data as BannerContentData;
}

function getTestimonialData(item: ContentItem): TestimonialContentData {
  return item.data as TestimonialContentData;
}

function getFaqData(item: ContentItem): FaqContentData {
  return item.data as FaqContentData;
}

export async function getPublicHomeData(): Promise<PublicHomeData> {
  const [settings, categories, products, banners, testimonials, faqs] =
    await Promise.all([
      getSiteSettings(),
      listCategories(),
      listProducts(),

      listContentItems("banner"),

      listContentItems("testimonial"),

      listContentItems("faq"),
    ]);

  const activeCategories = sortByOrder(
    categories.filter((category) => category.status === "active"),
  );

  const activeCategoryIds = new Set(
    activeCategories.map((category) => category.id),
  );

  const publishedProducts = sortByOrder(
    products.filter(
      (product) =>
        product.publicationStatus === "published" &&
        product.stockStatus !== "unavailable" &&
        activeCategoryIds.has(product.categoryId),
    ),
  );

  const featuredProducts = publishedProducts.filter(
    (product) => product.isFeatured,
  );

  const selectedProducts = (
    featuredProducts.length > 0 ? featuredProducts : publishedProducts
  ).slice(0, 8);

  const publishedBanners = sortByOrder(
    banners.filter(
      (banner) =>
        banner.status === "published" && Boolean(getBannerData(banner).title),
    ),
  );

  const publishedTestimonials = sortByOrder(
    testimonials.filter((testimonial) => {
      if (testimonial.status !== "published") {
        return false;
      }

      const data = getTestimonialData(testimonial);

      return Boolean(data.customerName && data.quote);
    }),
  ).slice(0, 6);

  const publishedFaqs = sortByOrder(
    faqs.filter((faq) => {
      if (faq.status !== "published") {
        return false;
      }

      const data = getFaqData(faq);

      return Boolean(data.question && data.answer);
    }),
  ).slice(0, 10);

  return {
    settings,
    categories: activeCategories,

    products: selectedProducts,

    heroBanner: publishedBanners[0] ?? null,

    testimonials: publishedTestimonials,

    faqs: publishedFaqs,
  };
}

export async function getPublicInformationPage(
  slug: ContentPageSlug,
): Promise<ContentPage | null> {
  const pages = await listContentPages();

  const page = pages.find((currentPage) => currentPage.slug === slug) ?? null;

  if (!page || page.status !== "published") {
    return null;
  }

  return page;
}
