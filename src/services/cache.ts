import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { CachedContent, ContentData } from '../types';

interface TravelGuideDB extends DBSchema {
  content: {
    key: string;
    value: CachedContent;
    indexes: { 'by-country': string };
  };
}

const DB_NAME = 'travel-guide-cache';
const DB_VERSION = 1;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

let dbInstance: IDBPDatabase<TravelGuideDB> | null = null;

async function getDB(): Promise<IDBPDatabase<TravelGuideDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<TravelGuideDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('content', { keyPath: 'contentPath' });
      store.createIndex('by-country', 'countrySlug');
    },
  });

  return dbInstance;
}

function getCacheKey(countrySlug: string, contentPath: string): string {
  return `${countrySlug}/${contentPath}`;
}

export async function getCachedContent(
  countrySlug: string,
  contentPath: string
): Promise<ContentData | null> {
  const db = await getDB();
  const key = getCacheKey(countrySlug, contentPath);
  const cached = await db.get('content', key);

  if (!cached) return null;

  // Check if cache is expired
  if (Date.now() - cached.cachedAt > CACHE_TTL) {
    await db.delete('content', key);
    return null;
  }

  return cached.data;
}

export async function setCachedContent(
  countrySlug: string,
  contentPath: string,
  data: ContentData
): Promise<void> {
  const db = await getDB();
  const key = getCacheKey(countrySlug, contentPath);

  await db.put('content', {
    countrySlug,
    contentPath: key,
    data,
    cachedAt: Date.now(),
  });
}

export async function invalidateCache(countrySlug: string, contentPath?: string): Promise<void> {
  const db = await getDB();

  if (contentPath) {
    const key = getCacheKey(countrySlug, contentPath);
    await db.delete('content', key);
  } else {
    // Invalidate all content for a country
    const tx = db.transaction('content', 'readwrite');
    const index = tx.store.index('by-country');

    let cursor = await index.openCursor(IDBKeyRange.only(countrySlug));
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
  }
}

export async function clearAllCache(): Promise<void> {
  const db = await getDB();
  await db.clear('content');
}

export async function getCacheStats(): Promise<{ count: number; size: number }> {
  const db = await getDB();
  const all = await db.getAll('content');

  const size = all.reduce((acc, item) => {
    return acc + new Blob([JSON.stringify(item)]).size;
  }, 0);

  return { count: all.length, size };
}
