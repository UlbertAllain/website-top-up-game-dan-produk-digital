export const SITE_SETTINGS_DOCUMENT_ID = "main";

export type SiteSettingsInput = {
  businessName: string;
  businessTagline: string;
  businessDescription: string;

  whatsappNumber: string;
  whatsappMessageTemplate: string;

  email: string;
  address: string;
  operatingHours: string;

  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  youtubeUrl: string;

  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
};

export type SiteSettings = SiteSettingsInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
