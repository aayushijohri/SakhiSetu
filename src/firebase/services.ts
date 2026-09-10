import { db } from "./config";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import type { User, SHG, Member, Meeting, Transaction, TrustPassport, ReportItem } from "@/types";

export const isFirebaseConfigured = (): boolean => db !== null;

export async function fetchSHGDetails(shgId: string): Promise<SHG | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, "shgs", shgId);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as SHG) : null;
  } catch (err) {
    console.warn("Firestore fetch error:", err);
    return null;
  }
}

export async function fetchMembersFromFirestore(shgId: string): Promise<Member[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, "members"), where("shgId", "==", shgId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Member);
  } catch (err) {
    console.warn("Firestore members error:", err);
    return [];
  }
}

export async function saveTransactionToFirestore(transaction: Transaction): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, "transactions", transaction.id);
    await setDoc(docRef, { ...transaction, synced: true });
    return true;
  } catch (err) {
    console.warn("Firestore save transaction error:", err);
    return false;
  }
}

export async function saveMeetingToFirestore(meeting: Meeting): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, "meetings", meeting.id);
    await setDoc(docRef, meeting);
    return true;
  } catch (err) {
    console.warn("Firestore save meeting error:", err);
    return false;
  }
}

export async function syncQueueToFirestore(queueItems: any[]): Promise<string[]> {
  if (!db || queueItems.length === 0) return [];
  const syncedIds: string[] = [];

  for (const item of queueItems) {
    try {
      const colRef = collection(db, item.collection);
      if (item.action === "create" || item.action === "update") {
        const itemDoc = doc(db, item.collection, item.payload.id || String(Date.now()));
        await setDoc(itemDoc, item.payload, { merge: true });
      }
      syncedIds.push(item.id);
    } catch (e) {
      console.error(`Failed to sync item ${item.id} to Firestore`, e);
    }
  }

  return syncedIds;
}
