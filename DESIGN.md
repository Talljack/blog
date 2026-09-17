# Talljack — Design Direction

## 1. Visual theme

An editorial builder's notebook: warm, human, and exact rather than glossy. The page should feel like a working surface where products are being shipped, with real project signals taking priority over decoration.

## 2. Palette

- Canvas: `oklch(0.98 0.006 95)` — warm light background
- Ink: `oklch(0.20 0.012 95)` — primary text
- Muted ink: `oklch(0.49 0.012 95)` — supporting copy
- Signal: `oklch(0.82 0.19 128)` — shipped / active / primary action
- Dark canvas: `oklch(0.13 0.008 95)`
- Dark surface: `rgba(255, 255, 255, 0.04)`

## 3. Typography

LXGW WenKai Lite is the display and Chinese reading face: its handwritten editorial character makes the site feel authored. System sans remains the Latin fallback; JetBrains Mono is reserved for labels and technical metadata. Display headings use `-0.022em` tracking, section headings use `-0.012em`.

## 4. Components

Links are text-first with visible focus rings. Primary actions use the signal color, 8px radius, and `scale(.96)` on press. Project rows remain mostly cardless; only the current flagship product receives an elevated surface.

## 5. Layout

The content grid is 1024px wide with an asymmetric hero and generous section breaks. The sequence is: positioning → proof → flagship work → open-source ecosystem → writing → subscription.

## 6. Depth

Light mode uses warm canvas and one restrained shadow for the flagship surface. Dark mode uses luminance steps rather than dark shadows.

## 7. Guardrails

- No purple/blue gradients.
- No equal three-card feature grids.
- No decorative glass surfaces.
- Use one lime signal color only.
- Keep project outcomes ahead of technology lists.
- Preserve keyboard focus and 40px touch targets.

## 8. Responsive behavior

The hero collapses to one column below 768px. Project actions wrap under descriptions, and every interactive target remains at least 40px tall. Motion is removed when reduced motion is requested.

## 9. Prompt guide

- Canvas `oklch(0.98 0.006 95)`, ink `oklch(0.20 0.012 95)`, signal `oklch(0.82 0.19 128)`.
- Create a 48px/1.04/600 hero with `-0.022em` tracking and an asymmetric 2:1 desktop grid.
- Create project rows with 12px vertical rhythm, monospace 11px metadata, and a 1px low-contrast divider.
- Create a signal action with 8px radius, dark ink on lime, and `scale(.96)` active state.
