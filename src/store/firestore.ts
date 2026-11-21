import { getFirestore, collection, addDoc, getDocs, orderBy, query, limit } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import type { MeetingSummary } from '../core/types';
import type { HistoryEntry } from '../ui/hud';

const COLLECTION = 'summaries';

export interface SaveInput {
  sanitized: string;
  held: number;
  summary?: MeetingSummary;
}

/** Persist a sanitized entry (never the raw transcript). */
export async function saveSummary(app: FirebaseApp, input: SaveInput): Promise<void> {
  const db = getFirestore(app);
  await addDoc(collection(db, COLLECTION), {
    sanitized: input.sanitized,
    held: input.held,
    ...(input.summary
      ? {
          overview: input.summary.overview,
          decisions: input.summary.decisions,
          actions: input.summary.actions,
          risks: input.summary.risks,
        }
      : {}),
    createdAt: Date.now(),
  });
}

/** Load the most recent sanitized entries. */
export async function listSummaries(app: FirebaseApp): Promise<HistoryEntry[]> {
  const db = getFirestore(app);
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(10)),
  );
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    return {
      sanitized: (data.sanitized as string) ?? '',
      createdAt: (data.createdAt as number) ?? 0,
      held: (data.held as number) ?? 0,
      summary:
        typeof data.overview === 'string'
          ? {
              overview: data.overview as string,
              decisions: (data.decisions as string[]) ?? [],
              actions: (data.actions as string[]) ?? [],
              risks: (data.risks as string[]) ?? [],
            }
          : undefined,
    };
  });
}
