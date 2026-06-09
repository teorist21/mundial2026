import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, off } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDFnekC5Ww5n3i8oUnP-d3ML54vXHzdH8w",
  authDomain: "mundial2026-ede12.firebaseapp.com",
  databaseURL: "https://mundial2026-ede12-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mundial2026-ede12",
  storageBucket: "mundial2026-ede12.firebasestorage.app",
  messagingSenderId: "1030988650712",
  appId: "1:1030988650712:web:0984dc41d189322bf39fad"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Write data
export async function dbSet(path, value) {
  try {
    await set(ref(db, path), value);
  } catch (e) {
    console.error("dbSet error:", e);
  }
}

// Read once
export async function dbGet(path) {
  try {
    const snap = await get(ref(db, path));
    return snap.exists() ? snap.val() : null;
  } catch (e) {
    console.error("dbGet error:", e);
    return null;
  }
}

// Subscribe to real-time updates
export function dbSubscribe(path, callback) {
  const r = ref(db, path);
  onValue(r, (snap) => {
    callback(snap.exists() ? snap.val() : null);
  });
  return () => off(r);
}

export { db };
