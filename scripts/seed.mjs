import { cert, deleteApp, getApps, initializeApp } from "firebase-admin/app";

import { getFirestore, Timestamp } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    [
      "Konfigurasi Firebase Admin belum lengkap.",
      "",
      "Pastikan .env.local memiliki:",
      "- FIREBASE_PROJECT_ID",
      "- FIREBASE_CLIENT_EMAIL",
      "- FIREBASE_PRIVATE_KEY",
    ].join("\n"),
  );

  process.exit(1);
}

const firebaseAdminApp =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

const db = getFirestore(firebaseAdminApp);

const now = Timestamp.now();

const categories = [
  {
    id: "top-up-game",

    data: {
      name: "Top Up Game",
      slug: "top-up-game",
      type: "top_up",

      description: "Layanan pengisian diamond, credit, dan mata uang game.",

      status: "active",
      order: 1,

      createdAt: now,
      updatedAt: now,
    },
  },

  {
    id: "akun-game",

    data: {
      name: "Akun Game",
      slug: "akun-game",
      type: "game_account",

      description: "Pilihan akun game dengan informasi yang transparan.",

      status: "active",
      order: 2,

      createdAt: now,
      updatedAt: now,
    },
  },

  {
    id: "subscription",

    data: {
      name: "Subscription",
      slug: "subscription",
      type: "subscription",

      description: "Berbagai pilihan aplikasi dan layanan premium.",

      status: "active",
      order: 3,

      createdAt: now,
      updatedAt: now,
    },
  },

  {
    id: "nomor-kosong",

    data: {
      name: "Nomor Kosong",
      slug: "nomor-kosong",
      type: "phone_number",

      description: "Pilihan nomor berdasarkan negara dan provider.",

      status: "active",
      order: 4,

      createdAt: now,
      updatedAt: now,
    },
  },
];

const products = [
  {
    id: "11111111-1111-4111-8111-111111111111",

    data: {
      code: "TOP-11111111",

      name: "Mobile Legends 86 Diamonds",

      slug: "mobile-legends-86-diamonds",

      categoryId: "top-up-game",
      type: "top_up",

      shortDescription: "Top up 86 Diamonds Mobile Legends melalui admin.",

      description:
        "Pemesanan dilakukan melalui WhatsApp. Siapkan User ID dan Zone ID akun Mobile Legends.",

      price: 22000,
      discountPrice: 20000,

      publicationStatus: "published",

      stockStatus: "available",

      isFeatured: true,
      order: 1,

      thumbnail: null,
      gallery: [],

      whatsappMessage: "",

      specifications: {
        gameName: "Mobile Legends",

        nominal: "86 Diamonds",

        gameCurrency: "Diamond",

        estimatedProcess: "5–15 menit",
      },

      createdAt: now,
      updatedAt: now,
    },
  },

  {
    id: "22222222-2222-4222-8222-222222222222",

    data: {
      code: "ACC-22222222",

      name: "Akun Mobile Legends Mythic",

      slug: "akun-mobile-legends-mythic",

      categoryId: "akun-game",
      type: "game_account",

      shortDescription: "Akun Mobile Legends rank Mythic dengan koleksi skin.",

      description:
        "Detail akun dapat dikonfirmasi kepada admin sebelum pembelian.",

      price: 750000,
      discountPrice: null,

      publicationStatus: "published",

      stockStatus: "available",

      isFeatured: true,
      order: 2,

      thumbnail: null,
      gallery: [],

      whatsappMessage: "",

      specifications: {
        gameName: "Mobile Legends",

        rank: "Mythic",
        level: "85",

        region: "Indonesia",

        skinCount: "120+ Skin",

        loginMethod: "Moonton",

        warranty: "Garansi sesuai ketentuan admin",
      },

      createdAt: now,
      updatedAt: now,
    },
  },

  {
    id: "33333333-3333-4333-8333-333333333333",

    data: {
      code: "SUB-33333333",

      name: "Canva Pro 1 Bulan",

      slug: "canva-pro-1-bulan",

      categoryId: "subscription",

      type: "subscription",

      shortDescription: "Akses Canva Pro dengan durasi satu bulan.",

      description:
        "Aktivasi dilakukan melalui email pelanggan dan diproses manual oleh admin.",

      price: 25000,
      discountPrice: null,

      publicationStatus: "published",

      stockStatus: "available",

      isFeatured: true,
      order: 3,

      thumbnail: null,
      gallery: [],

      whatsappMessage: "",

      specifications: {
        applicationName: "Canva",

        planName: "Canva Pro",

        duration: "1 Bulan",

        accessType: "Aktivasi ke email pelanggan",

        activationMethod: "Undangan melalui email",

        warranty: "Garansi selama masa aktif sesuai ketentuan",
      },

      createdAt: now,
      updatedAt: now,
    },
  },

  {
    id: "44444444-4444-4444-8444-444444444444",

    data: {
      code: "NUM-44444444",

      name: "Nomor Indonesia Telkomsel",

      slug: "nomor-indonesia-telkomsel",

      categoryId: "nomor-kosong",

      type: "phone_number",

      shortDescription: "Nomor Indonesia berdasarkan stok yang tersedia.",

      description:
        "Ketersediaan nomor harus dikonfirmasi kepada admin sebelum pembayaran.",

      price: 15000,
      discountPrice: null,

      publicationStatus: "published",

      stockStatus: "limited",

      isFeatured: false,
      order: 4,

      thumbnail: null,
      gallery: [],

      whatsappMessage: "",

      specifications: {
        country: "Indonesia",

        provider: "Telkomsel",

        numberType: "Nomor kosong",

        activePeriod: "Sesuai informasi admin",

        estimatedProcess: "5–30 menit",
      },

      createdAt: now,
      updatedAt: now,
    },
  },
];

const siteSettings = [
  {
    id: "main",

    data: {
      businessName: "Digital Product Store",

      tagline: "Produk digital untuk kebutuhanmu.",

      description:
        "Menyediakan berbagai produk dan layanan digital dengan proses pemesanan melalui admin.",

      whatsappNumber: "",

      whatsappMessageTemplate: [
        "Halo Admin {businessName}, saya tertarik dengan produk berikut:",
        "",
        "Produk: {productName}",
        "Kode: {productCode}",
        "Harga: {productPrice}",
        "",
        "Apakah produk ini masih tersedia?",
      ].join("\n"),

      email: "",
      address: "",

      businessHours: "Senin–Minggu, 08.00–22.00 WIB",

      socialMedia: {
        instagram: "",
        facebook: "",
        tiktok: "",
        youtube: "",
      },

      seo: {
        title: "Digital Product Store",

        description:
          "Katalog top up game, akun game, subscription, dan nomor kosong.",

        keywords: [
          "top up game",
          "akun game",
          "subscription",
          "produk digital",
        ],
      },

      updatedAt: now,
    },
  },
];

async function seedDocuments(collectionName, records) {
  const references = records.map((record) =>
    db.collection(collectionName).doc(record.id),
  );

  const snapshots = await db.getAll(...references);

  const existingIds = new Set(
    snapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => snapshot.id),
  );

  const missingRecords = records.filter(
    (record) => !existingIds.has(record.id),
  );

  if (missingRecords.length === 0) {
    console.log(`- ${collectionName}: seluruh data sudah tersedia.`);

    return {
      created: 0,
      skipped: records.length,
    };
  }

  const batch = db.batch();

  for (const record of missingRecords) {
    const reference = db.collection(collectionName).doc(record.id);

    batch.set(reference, record.data);
  }

  await batch.commit();

  console.log(
    `- ${collectionName}: ${missingRecords.length} dibuat, ${existingIds.size} dilewati.`,
  );

  return {
    created: missingRecords.length,

    skipped: existingIds.size,
  };
}

async function runSeed() {
  console.log("");
  console.log("Menjalankan seed data...");

  console.log(`Firebase project: ${projectId}`);

  console.log("");

  const categoryResult = await seedDocuments("categories", categories);

  const productResult = await seedDocuments("products", products);

  const settingsResult = await seedDocuments("siteSettings", siteSettings);

  console.log("");
  console.log("Seed selesai.");

  console.log(`Kategori dibuat: ${categoryResult.created}`);

  console.log(`Kategori dilewati: ${categoryResult.skipped}`);

  console.log(`Produk dibuat: ${productResult.created}`);

  console.log(`Produk dilewati: ${productResult.skipped}`);

  console.log(`Pengaturan dibuat: ${settingsResult.created}`);

  console.log(`Pengaturan dilewati: ${settingsResult.skipped}`);
}

try {
  await runSeed();
} catch (error) {
  console.error("");
  console.error("Seed gagal:");

  console.error(error instanceof Error ? error.message : error);

  process.exitCode = 1;
} finally {
  await deleteApp(firebaseAdminApp);
}
