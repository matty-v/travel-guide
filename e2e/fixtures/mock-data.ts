import type { Country, ContentData } from '../../src/types';

export const mockCountries: Country[] = [
  {
    id: '1',
    name: 'Italy',
    slug: 'italy',
    description: 'Explore the beauty of Italy',
    palette: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#f59e0b',
      background: '#1f2937',
      text: '#f3f4f6',
    },
    menuItems: [
      {
        id: 'item-1',
        type: 'region',
        title: 'Overview',
        slug: 'overview',
        contentType: 'markdown',
        contentPath: 'overview.md',
        order: 0,
      },
      {
        id: 'item-2',
        type: 'city',
        title: 'Rome',
        slug: 'rome',
        contentType: 'markdown',
        contentPath: 'rome.md',
        order: 1,
      },
      {
        id: 'item-3',
        type: 'sight',
        title: 'Travel Guide PDF',
        slug: 'guide-pdf',
        contentType: 'pdf',
        contentPath: 'guide.pdf',
        order: 2,
      },
    ],
  },
  {
    id: '2',
    name: 'Japan',
    slug: 'japan',
    description: 'Discover the wonders of Japan',
    palette: {
      primary: '#dc2626',
      secondary: '#991b1b',
      accent: '#fbbf24',
      background: '#1f2937',
      text: '#f3f4f6',
    },
    menuItems: [
      {
        id: 'item-4',
        type: 'region',
        title: 'Overview',
        slug: 'overview',
        contentType: 'markdown',
        contentPath: 'overview.md',
        order: 0,
      },
    ],
  },
];

export const mockContent: Record<string, ContentData> = {
  'italy/overview.md': {
    markdown: '# Welcome to Italy\n\nItaly is a beautiful country known for its rich history, art, and cuisine.\n\n## Highlights\n\n- Ancient Roman ruins\n- Renaissance art\n- Delicious pasta and pizza',
    etag: 'etag-italy-overview',
    lastModified: '2024-01-01T00:00:00Z',
  },
  'italy/rome.md': {
    markdown: '# Rome\n\nThe Eternal City offers countless attractions.\n\n## Must See\n\n- Colosseum\n- Vatican City\n- Trevi Fountain',
    etag: 'etag-italy-rome',
    lastModified: '2024-01-01T00:00:00Z',
  },
  'japan/overview.md': {
    markdown: '# Welcome to Japan\n\nJapan blends ancient traditions with modern innovation.\n\n## Highlights\n\n- Historic temples\n- Cherry blossoms\n- World-class cuisine',
    etag: 'etag-japan-overview',
    lastModified: '2024-01-01T00:00:00Z',
  },
};

export const mockLoginResponse = {
  success: true,
  token: 'mock-admin-token-12345',
};

export const mockLoginErrorResponse = {
  success: false,
  error: 'Invalid password',
};
