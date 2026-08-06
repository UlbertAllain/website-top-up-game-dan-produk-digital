import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const email = process.argv[2];

if (!email) {
  console.error("Gunakan: npm run admin:grant -- admin@email.com");
  process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Konfigurasi Firebase Admin belum lengkap.");
  process.exit(1);
}

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

const auth = getAuth(app);

try {
  const user = await auth.getUserByEmail(email.trim());

  await auth.setCustomUserClaims(user.uid, {
    ...(user.customClaims ?? {}),
    admin: true,
  });

  console.log(`Akses admin berhasil diberikan kepada ${email}.`);
} catch (error) {
  console.error(
    "Gagal memberikan akses admin:",
    error instanceof Error ? error.message : error,
  );

  process.exit(1);
}
