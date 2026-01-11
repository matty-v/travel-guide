# Voget Travel Logo Design

## Overview

A new logo for the Voget Travel app to replace the default Vite branding. The design reflects the app's purpose: a personal travel guide shared with friends and extended network.

## Brand Direction

| Attribute | Decision |
|-----------|----------|
| Audience | Friends & extended network |
| Feeling | Warm, personal, trustworthy |
| Style | Simple, clean, geometric with soft touches |

## Design Concept: Friendly Compass with V-Needle

A circular compass with a stylized "V" serving as the needle pointing north. The "V" represents both directional guidance and the Voget brand initial.

### Structure

- **Compass ring**: Circular outline with medium stroke weight and rounded line caps
- **V-needle**: Chevron/arrow pointing upward (north), centered in the ring
  - Clean geometric lines with slightly softened points
  - Takes up 50-60% of inner circle space
- **Cardinal markers**: Four small dots or tick marks at N/E/S/W positions
  - North marker slightly larger to emphasize direction

### Colors

| Element | Color | Hex |
|---------|-------|-----|
| V-needle (primary) | Blue | `#3b82f6` |
| Compass ring & markers | Dark blue | `#1e40af` |
| Background (PWA icons) | White | `#ffffff` |

### Proportions

- V-needle: ~50-60% of inner compass space
- PWA icons: ~15% padding from edges
- Cardinal markers: Small enough to not clutter, large enough to read as compass

## Deliverables

| File | Size | Description |
|------|------|-------------|
| `favicon.svg` | Vector | Full compass, blue on transparent |
| `favicon.ico` | 32x32 | Solid blue circle with white V (simplified) |
| `pwa-192x192.png` | 192x192 | Full compass on white rounded background |
| `pwa-512x512.png` | 512x512 | Full compass on white rounded background |
| `apple-touch-icon.png` | 180x180 | Full compass on white background for iOS |

## Implementation Notes

- Favicon uses simplified design (just V on blue circle) for clarity at small sizes
- PWA icons use full compass design with adequate padding
- All icons should align with current theme color `#3b82f6`
- Update `index.html` favicon reference
- Update `vite.config.ts` PWA manifest if needed

## Files to Update

1. `public/vite.svg` → Replace with `favicon.svg`
2. `public/pwa-192x192.png` → Replace with new design
3. `public/pwa-512x512.png` → Replace with new design
4. `index.html` → Update favicon reference if filename changes
5. Add `public/apple-touch-icon.png` for iOS support
