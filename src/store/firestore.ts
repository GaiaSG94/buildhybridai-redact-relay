import { getFirestore, collection, addDoc, getDocs, orderBy, query, limit } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';

const COLLECTION = 'summaries';

/** Persist a sanitized summary (never the raw transcript). */
export async function saveSummary(app: FirebaseApp, sanitized: string): Promise<void> {
  const db = getFirestore(app);
  await addDoc(collection(db, COLLECTION), {
    sanitized,
    createdAt: Date.now(),
  });
}

/** Load the most recent sanitized summaries. */
export async function listSummaries(app: FirebaseApp): Promise<string[]> {
  const db = getFirestore(app);
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(10)),
  );
  return snapshot.docs.map((doc) => {
    const data = doc.data() as { sanitized?: string };
    return data.sanitized ?? '';
  });
}
