import { useState, useCallback } from 'react';
import type { ContentData } from '../types';
import { fetchContent } from '../services/api';
import { getCachedContent, setCachedContent } from '../services/cache';

interface UseContentResult {
  content: ContentData | null;
  loading: boolean;
  error: string | null;
  loadContent: (countrySlug: string, contentPath: string) => Promise<void>;
}

export function useContent(): UseContentResult {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async (countrySlug: string, contentPath: string) => {
    setLoading(true);
    setError(null);

    try {
      // Try cache first
      const cached = await getCachedContent(countrySlug, contentPath);
      if (cached) {
        setContent(cached);
        setLoading(false);

        // Fetch in background to check for updates
        fetchContent(countrySlug, contentPath)
          .then(async (fresh) => {
            if (fresh.etag !== cached.etag) {
              await setCachedContent(countrySlug, contentPath, fresh);
              setContent(fresh);
            }
          })
          .catch(() => {
            // Silently fail background refresh
          });

        return;
      }

      // No cache, fetch from API
      const data = await fetchContent(countrySlug, contentPath);
      await setCachedContent(countrySlug, contentPath, data);
      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  return { content, loading, error, loadContent };
}
