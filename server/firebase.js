import { readFileSync } from "fs";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(
  readFileSync("/etc/secrets/Mediately_serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export { db };