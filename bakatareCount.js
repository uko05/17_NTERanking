// bakatareCount.js
import { db } from './firebaseConfig.js';
import {
  doc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

export async function incrementBakatareCount(filename) {
  const ref = doc(db, "bakatareCountsNTE", filename);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) {
        tx.set(ref, { count: 1, updatedAt: serverTimestamp() });
      } else {
        tx.update(ref, { count: snap.data().count + 1, updatedAt: serverTimestamp() });
      }
    });
  } catch (e) {
    console.error("ばかたれ集計失敗", e);
  }
}
