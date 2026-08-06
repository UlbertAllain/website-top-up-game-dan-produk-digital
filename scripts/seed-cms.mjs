import { cert, deleteApp, getApps, initializeApp } from "firebase-admin/app";

import { getFirestore, Timestamp } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Konfigurasi Firebase Admin belum lengkap.");

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

const contentItems = [
  {
    id: "55555555-5555-4555-8555-555555555555",

    data: {
      kind: "banner",
      status: "published",
      order: 1,

      data: {
        title: "Semua Kebutuhan Digital dalam Satu Tempat",

        subtitle:
          "Temukan layanan top up game, akun game, subscription, dan nomor kosong dengan proses pemesanan langsung melalui admin.",

        ctaLabel: "Lihat Produk",

        ctaUrl: "/products",

        image: null,
      },

      createdAt: now,
      updatedAt: now,
    },
  },

  {
    id: "66666666-6666-4666-8666-666666666661",

    data: {
      kind: "faq",
      status: "published",
      order: 1,

      data: {
        question: "Bagaimana cara melakukan pemesanan?",

        answer:
          "Pilih produk yang diinginkan, baca detail produk, kemudian tekan tombol pesan melalui WhatsApp untuk menghubungi admin.",
      },

      createdAt: now,
      updatedAt: now,
    },
  },

  {
    id: "66666666-6666-4666-8666-666666666662",

    data: {
      kind: "faq",
      status: "published",
      order: 2,

      data: {
        question: "Apakah pembayaran dilakukan melalui website?",

        answer:
          "Tidak. Pembayaran dan konfirmasi pemesanan dilakukan langsung melalui WhatsApp setelah admin memastikan produk tersedia.",
      },

      createdAt: now,
      updatedAt: now,
    },
  },

  {
    id: "66666666-6666-4666-8666-666666666663",

    data: {
      kind: "faq",
      status: "published",
      order: 3,

      data: {
        question: "Berapa lama proses pemesanan?",

        answer:
          "Waktu proses berbeda untuk setiap produk. Estimasi proses dapat dilihat pada detail produk atau dikonfirmasi langsung kepada admin.",
      },

      createdAt: now,
      updatedAt: now,
    },
  },

  {
    id: "77777777-7777-4777-8777-777777777771",

    data: {
      kind: "testimonial",
      status: "published",
      order: 1,

      data: {
        customerName: "Pelanggan Pertama",

        customerRole: "Pembeli Produk Digital",

        quote:
          "Proses pemesanannya mudah dan admin memberikan penjelasan dengan jelas.",

        rating: 5,
        avatar: null,
      },

      createdAt: now,
      updatedAt: now,
    },
  },
];

const pages = [
  {
    id: "about",

    data: {
      title: "Tentang Kami",

      excerpt: "Kenali lebih dekat bisnis dan layanan yang kami sediakan.",

      content:
        "Kami menyediakan berbagai produk dan layanan digital yang dapat dipesan dengan mudah melalui WhatsApp. Setiap pertanyaan dan proses pemesanan akan dilayani langsung oleh admin.",

      status: "draft",
      updatedAt: now,
    },
  },

  {
    id: "how-to-order",

    data: {
      title: "Cara Pemesanan",

      excerpt: "Panduan singkat untuk melakukan pemesanan produk.",

      content: [
        "1. Pilih produk yang diinginkan.",
        "2. Baca detail, harga, dan ketentuan produk.",
        "3. Tekan tombol pesan melalui WhatsApp.",
        "4. Konfirmasikan ketersediaan produk kepada admin.",
        "5. Ikuti petunjuk pembayaran dan proses yang diberikan admin.",
      ].join("\n"),

      status: "draft",
      updatedAt: now,
    },
  },

  {
    id: "terms",

    data: {
      title: "Syarat dan Ketentuan",

      excerpt: "Ketentuan penggunaan layanan dan pemesanan produk.",

      content:
        "Pelanggan wajib membaca detail produk sebelum melakukan pembayaran. Proses, estimasi waktu, garansi, dan ketentuan lainnya dapat berbeda pada setiap produk dan akan dikonfirmasi oleh admin.",

      status: "draft",
      updatedAt: now,
    },
  },

  {
    id: "privacy",

    data: {
      title: "Kebijakan Privasi",

      excerpt: "Informasi mengenai penggunaan data pelanggan.",

      content:
        "Data yang diberikan pelanggan hanya digunakan untuk membantu proses komunikasi dan pemesanan. Kami tidak menjual atau membagikan data pelanggan kepada pihak lain tanpa alasan yang sah.",

      status: "draft",
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

    return;
  }

  const batch = db.batch();

  for (const record of missingRecords) {
    const reference = db.collection(collectionName).doc(record.id);

    batch.set(reference, record.data);
  }

  await batch.commit();

  console.log(`- ${collectionName}: ${missingRecords.length} data dibuat.`);
}

async function runSeed() {
  console.log("");
  console.log("Menjalankan seed CMS...");

  await seedDocuments("contentItems", contentItems);

  await seedDocuments("pages", pages);

  console.log("");
  console.log("Seed CMS selesai.");
}

try {
  await runSeed();
} catch (error) {
  console.error("");
  console.error("Seed CMS gagal:");

  console.error(error instanceof Error ? error.message : error);

  process.exitCode = 1;
} finally {
  await deleteApp(firebaseAdminApp);
}
