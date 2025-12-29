export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export type ContentType = 'markdown' | 'pdf';

export interface MenuItem {
  id: string;
  type: 'region' | 'city' | 'sight';
  title: string;
  slug: string;
  contentType: ContentType;
  contentPath: string;
  order: number;
  children?: MenuItem[];
}

export interface Country {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  landingPage?: string;
  palette: ColorPalette;
  menuItems: MenuItem[];
}

export interface ContentData {
  markdown: string;
  etag: string;
  lastModified: string;
}

export interface CachedContent {
  countrySlug: string;
  contentPath: string;
  data: ContentData;
  cachedAt: number;
}

export interface AuthState {
  isAdmin: boolean;
  loading: boolean;
}

export const DEFAULT_PALETTE: ColorPalette = {
  primary: '#3b82f6',
  secondary: '#1e40af',
  accent: '#f59e0b',
  background: '#1f2937',
  text: '#f3f4f6',
};
