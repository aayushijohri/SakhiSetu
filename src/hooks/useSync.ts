import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { dbLocal, seedDatabase } from "@/lib/dexie";
import { isFirebaseConfigured, syncQueueToFirestore } from "@/firebase/services";

export function useSync() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>("Just now");

  // Get count of queued offline sync items
  const queueItems = useLiveQuery(() => dbLocal.syncQueue.toArray(), []);
  const pendingCount = queueItems ? queueItems.length : 0;

  useEffect(() => {
    // Seed local IndexedDB on app boot
    seedDatabase();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const triggerSync = async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);

    try {
      const items = await dbLocal.syncQueue.toArray();
      if (items.length > 0 && isFirebaseConfigured()) {
        const syncedIds = await syncQueueToFirestore(items);
        if (syncedIds.length > 0) {
          await dbLocal.syncQueue.bulkDelete(syncedIds);
        }
      }
      setLastSynced(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.error("Auto-sync error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSynced,
    triggerSync,
  };
}
