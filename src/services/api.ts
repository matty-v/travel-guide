import type { Country, MenuItem, ContentData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Country endpoints
export async function fetchCountries(): Promise<Country[]> {
  const response = await fetch(`${API_URL}/countries`);
  if (!response.ok) throw new Error('Failed to fetch countries');
  return response.json();
}

export async function fetchCountry(slug: string): Promise<Country> {
  const response = await fetch(`${API_URL}/countries/${slug}`);
  if (!response.ok) throw new Error('Failed to fetch country');
  return response.json();
}

export async function fetchContent(countrySlug: string, contentPath: string): Promise<ContentData> {
  const response = await fetch(`${API_URL}/content/${countrySlug}/${contentPath}`);
  if (!response.ok) throw new Error('Failed to fetch content');

  const markdown = await response.text();
  const etag = response.headers.get('etag') || '';
  const lastModified = response.headers.get('last-modified') || new Date().toISOString();

  return { markdown, etag, lastModified };
}

// Admin endpoints
export async function adminLogin(password: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return response.ok;
}

export async function createCountry(country: Omit<Country, 'id'>): Promise<Country> {
  const response = await fetch(`${API_URL}/admin/countries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(country),
  });
  if (!response.ok) throw new Error('Failed to create country');
  return response.json();
}

export async function updateCountry(slug: string, updates: Partial<Country>): Promise<Country> {
  const response = await fetch(`${API_URL}/admin/countries/${slug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update country');
  return response.json();
}

export async function deleteCountry(slug: string): Promise<void> {
  const response = await fetch(`${API_URL}/admin/countries/${slug}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error('Failed to delete country');
}

export async function updateMenuItem(
  countrySlug: string,
  menuItems: MenuItem[]
): Promise<Country> {
  return updateCountry(countrySlug, { menuItems });
}

export async function saveContent(
  countrySlug: string,
  contentPath: string,
  markdown: string
): Promise<void> {
  const response = await fetch(`${API_URL}/admin/content/${countrySlug}/${contentPath}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/markdown',
      ...getAuthHeader(),
    },
    body: markdown,
  });
  if (!response.ok) throw new Error('Failed to save content');
}

export async function deleteContent(countrySlug: string, contentPath: string): Promise<void> {
  const response = await fetch(`${API_URL}/admin/content/${countrySlug}/${contentPath}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error('Failed to delete content');
}
