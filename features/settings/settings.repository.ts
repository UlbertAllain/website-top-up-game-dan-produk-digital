import "server-only";

import { COLLECTIONS } from "@/constants/collections";
import {
  SITE_SETTINGS_DOCUMENT_ID,
  type SiteSettingsInput,
} from "@/features/settings/settings.types";
import { adminDb } from "@/lib/firebase/admin";

type SiteSettingsDocument = Partial<SiteSettingsInput> & {
  createdAt?: unknown;
  updatedAt?: unknown;
};

function getSettingsReference() {
  return adminDb
    .collection(COLLECTIONS.SITE_SETTINGS)
    .doc(SITE_SETTINGS_DOCUMENT_ID);
}

export async function getSiteSettingsDocument(): Promise<SiteSettingsDocument | null> {
  const snapshot = await getSettingsReference().get();

  if (!snapshot.exists) {
    return null;
  }

  const document = snapshot.data() as SiteSettingsDocument | undefined;

  return document ?? null;
}

export async function saveSiteSettingsDocument(
  settings: SiteSettingsInput,
): Promise<{
  document: SiteSettingsDocument;
  createdAt: string;
  updatedAt: string;
}> {
  const reference = getSettingsReference();

  const currentSnapshot = await reference.get();

  const now = new Date().toISOString();

  const currentData = currentSnapshot.exists
    ? (currentSnapshot.data() as SiteSettingsDocument | undefined)
    : undefined;

  const createdAt =
    typeof currentData?.createdAt === "string" ? currentData.createdAt : now;

  const document: SiteSettingsDocument = {
    ...settings,
    createdAt,
    updatedAt: now,
  };

  await reference.set(document, {
    merge: true,
  });

  return {
    document,
    createdAt,
    updatedAt: now,
  };
}
