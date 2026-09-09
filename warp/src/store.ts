/** IndexedDB save store. Plain JSON; a long campaign with portraits is comfortably inside quota. */
import type { SaveState } from "./engine/types";
import { sanitize } from "./engine/state";

const DB = "warp";
const STORE = "saves";

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE, { keyPath: "id" }); };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then((db) => new Promise<T>((res, rej) => {
    const store = db.transaction(STORE, mode).objectStore(STORE);
    const r = fn(store);
    r.onsuccess = () => res(r.result as T);
    r.onerror = () => rej(r.error);
  }));
}

/** Write direct — IndexedDB structured-clones correctly on its own. The JSON scrub is the fallback
 *  for the one case that needs it (a value clone refuses), not the default path: a save of any size
 *  serialised twice on every write is seconds of blocked main thread per turn. */
export async function putSave(s: SaveState): Promise<void> {
  s.updated_at = new Date().toISOString();
  try { await tx("readwrite", (store) => store.put(s)); }
  catch (err) {
    if (!(err instanceof DOMException) || err.name !== "DataCloneError") throw err;
    await tx("readwrite", (store) => store.put(JSON.parse(JSON.stringify(s))));
  }
}

export async function getSave(id: string): Promise<SaveState | null> {
  const raw = await tx<SaveState | undefined>("readonly", (store) => store.get(id));
  return raw ? sanitize(raw) : null;
}

export async function deleteSave(id: string): Promise<void> {
  await tx("readwrite", (store) => store.delete(id));
}

export async function listSaves(): Promise<{ id: string; name: string; updated_at: string; week: number; arcology: string; people: number }[]> {
  const all = await tx<SaveState[]>("readonly", (store) => store.getAll());
  return (all ?? []).map((s) => ({
    id: s.id, name: s.name, updated_at: s.updated_at,
    week: s.arcology?.week ?? 0, arcology: s.arcology?.name ?? "—",
    people: Object.keys(s.people ?? {}).length,
  })).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function exportSave(s: SaveState): void {
  const blob = new Blob([JSON.stringify(s)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${s.arcology.name.replace(/\W+/g, "-").toLowerCase()}-week-${s.arcology.week}.warp.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export async function importSave(file: File): Promise<SaveState> {
  const text = await file.text();
  const s = sanitize(JSON.parse(text) as SaveState);
  s.id = s.id || `warp-${Date.now().toString(36)}`;
  await putSave(s);
  return s;
}
