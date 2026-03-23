# Noor – The Complete Islamic Platform

Noor is a premium Islamic web experience designed for calm daily worship and reflection.
It brings prayer times, Quran, Hadith, duas, Tasbih, and Qibla guidance into one modern, responsive platform.

## Why Noor

- Spiritual-first design language with elegant emerald and gold tones
- Thoughtful typography with Arabic readability and balanced English hierarchy
- Smooth motion with reduced-motion support for accessibility
- Mobile-first layout and reusable page-shell system for consistency
- Scalable frontend architecture for long-term product growth

## Core Features

- Home hub with hero, daily quote, Ramadan countdown, and prayer preview
- Prayer times with geolocation and resilient API fallback
- Quran browsing with search, translation, and recitation audio
- Hadith reading with collection filtering and pagination
- Tasbih counter with persistent local state
- Qibla compass page with location + orientation support
- Categorized duas with expandable reading cards

## UX, Accessibility, and Trust

- Unified design system with shared spacing/typography patterns
- Semantic landmarks (`nav`, `main`, `footer`) and skip-to-content link
- Visible keyboard focus states and improved contrast treatment
- Reduced-motion variants for transitions and staggered reveals
- Production metadata with Open Graph, Twitter card, app icon, and apple icon

## Performance Strategy

- Route-level code splitting with lazy-loaded blocks where appropriate
- Lightweight icon strategy using Lucide icons in shared layout
- Internal API route for prayer time reliability
- Future-ready image strategy with `SmartImage` wrapper (`src/components/shared/smart-image.tsx`) built on `next/image`

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS + Shadcn UI
- Framer Motion
- Axios
- Zustand
- next-themes
- ESLint + Prettier

## Project Structure

- `src/app` - Routes, metadata files, API route handlers
- `src/components` - Layout, shared UI, motion, and feature components
- `src/hooks` - Client-side behavior hooks
- `src/lib` - API and constants
- `src/store` - Persistent and global state
- `src/types` - Shared domain typings
- `src/utils` - Domain helper utilities

## Environment

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Run production server
- `npm run lint` - Run lint checks
- `npm run format` - Apply formatting
- `npm run format:check` - Validate formatting

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Notes

- Prayer and Qibla pages require browser location permission.
- Device orientation features work best on real mobile hardware.
- If upstream prayer providers are temporarily unavailable, Noor shows graceful fallback timings.
