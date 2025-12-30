# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Travel Guide is a Progressive Web App (PWA) for exploring travel destinations. It has two interfaces:
- **Public viewer**: Browse countries and access curated travel content (markdown and PDFs)
- **Admin dashboard**: CRUD management of countries, content, menus, and color schemes

## Commands

```bash
# Development
npm run dev          # Start Vite dev server with HMR

# Build & Deploy
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint check
npm run preview      # Preview production build locally

# Deployment (requires GCP auth)
./deploy.sh                    # Deploy both frontend and functions
./deploy.sh --frontend         # Deploy frontend only
./deploy.sh --functions        # Deploy Cloud Functions only
```

## Architecture

### Frontend (React + TypeScript)
- **React 19** with **React Router 7** (HashRouter for static hosting)
- **Vite** for build tooling with PWA plugin (Workbox caching)
- **Tailwind CSS** with typography plugin for markdown rendering
- **IndexedDB** for offline content caching (24-hour TTL)

### Backend (Google Cloud Functions)
- Express API in `functions/src/index.ts`
- Google Cloud Storage for data persistence
- Node.js 20 runtime

### State Management
Two React Contexts in `src/context/`:
- **AuthContext**: Admin authentication, token stored in localStorage
- **CountryContext**: Countries list, selected country, and menu item state

### Component Structure
```
src/components/
├── layout/    # Layout, Header, Sidebar
├── viewer/    # Public components (CountryList, CountryPage, ContentView, PDFViewer)
├── admin/     # Admin tools (Dashboard, CountryManager, MenuEditor, ContentEditor, PaletteEditor)
└── common/    # Shared (MarkdownRenderer, LoadingSpinner)
```

### Data Flow
1. `src/services/api.ts` - REST API client with auth headers
2. `src/services/cache.ts` - IndexedDB caching layer
3. `src/hooks/useContent.ts` - Smart content loading (cache-first, then API with etag comparison)

### API Endpoints
- `GET /countries` - List all countries
- `GET /countries/:slug` - Single country
- `GET /content/:countrySlug/:contentPath` - Markdown/PDF content (supports etag)
- `POST /admin/login` - Password authentication
- Admin CRUD: `/admin/countries`, `/admin/content/:countrySlug/:contentPath`, `/admin/upload/:countrySlug/*`

## Environment Variables

**Frontend (.env)**
```
VITE_API_URL=https://your-region-your-project.cloudfunctions.net/api
```

**Functions (functions/.env)**
```
GCS_BUCKET=travel-guide-data
ADMIN_PASSWORD=your-secure-password-here
```

## Key Patterns

- **HashRouter**: URLs use `/#/` prefix for static hosting compatibility
- **Color customization**: Each country has a `palette` object (primary, secondary, accent, background, text)
- **PWA caching**: Stale-while-revalidate strategy via Workbox; API responses cached 24h, storage responses cached 7 days
- **File uploads**: Multipart form-data parsed with Busboy in Cloud Functions
