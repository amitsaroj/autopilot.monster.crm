# Landing Page Audit — Autopilot Monster CRM

**Audit date:** 2026-06-19  
**Scope:** Public marketing routes under `frontend/src/app/(marketing)/`  
**Status:** Issues identified and fixed in this session

---

## Executive Summary

The marketing site had 26 existing pages with polished UI but critical SEO gaps (global `noindex`, no sitemap/robots, no per-page metadata), missing `/features`, `/integrations`, and `/testimonials` routes, broken internal links, placeholder footer social URLs, and accessibility gaps on forms and navigation. All critical and high-priority issues were fixed.

---

## Pages Verified

| Page | Route | Status |
|------|-------|--------|
| Homepage | `/` | Fixed — SEO, demo link, feature links, structured data |
| Features | `/features` | **Created** — full feature grid with product links |
| Pricing | `/pricing` | Fixed — meta, schema, Enterprise CTA → `/contact` |
| Integrations | `/integrations` | **Created** — partner logos, API/connectors content |
| Testimonials | `/testimonials` | **Created** — 6 reviews + Review schema |
| Services | `/services` | Fixed — broken hrefs corrected |
| Product hub + subpages | `/product/*` | Verified — metadata layouts added |
| Blog | `/blog`, `/blog/[slug]` | Fixed — individual post routes |
| Legal / company | `/about`, `/contact`, `/demo`, etc. | Verified — metadata layouts added |

---

## SEO & Meta Tags

### Findings (before)

| Issue | Severity | Fix status |
|-------|----------|------------|
| Root `layout.tsx` set `robots: { index: false }` globally | Critical | **Fixed** — marketing layout overrides with `index: true`; app routes keep noindex |
| No `sitemap.xml` | Critical | **Fixed** — `frontend/src/app/sitemap.ts` (static + blog slugs) |
| No `robots.txt` | Critical | **Fixed** — `frontend/src/app/robots.ts` |
| No per-page title/description/canonical | High | **Fixed** — `lib/marketing/seo.ts` + route `layout.tsx` files |
| No Open Graph / Twitter cards | High | **Fixed** — included in `buildPageMetadata()` |
| No JSON-LD structured data | High | **Fixed** — Organization, WebSite, SoftwareApplication, Product/Offer, Review schemas |
| Missing `metadataBase` | Medium | **Fixed** — set in marketing layout via `SITE_URL` |

### Implementation

- **SEO utility:** `frontend/src/lib/marketing/seo.ts`
- **JSON-LD component:** `frontend/src/components/marketing/JsonLd.tsx`
- **Env:** `NEXT_PUBLIC_SITE_URL` (defaults to `https://autopilotmonster.com`)

---

## Broken Links & Missing Pages

### Fixed broken links

| Source | Broken href | Fixed href |
|--------|-------------|------------|
| Homepage hero | `/services` ("Watch Demo") | `/demo` |
| Services page | `/product/bulk-voice` | `/product/voice` |
| Services page | `/services/agentic-apps` | `/product/ai` |
| Services page | `/services/integrations` | `/integrations` |
| Services page | `/services/web-app-dev` | `/contact` |
| Services page | `/services/ecommerce` | `/contact` |
| Blog listing | `/blog` (all posts) | `/blog/[slug]` |
| Footer social | `#` | External profile URLs |
| Pricing Enterprise CTA | `/register` | `/contact` |

### Pages created

- `/features` — platform feature overview
- `/integrations` — integrations hub (complements `/product/integrations`)
- `/testimonials` — customer stories with schema markup
- `/blog/[slug]` — 6 static blog post pages

---

## Accessibility

| Issue | Fix status |
|-------|------------|
| No skip-to-content link | **Fixed** — marketing layout |
| Mobile nav button missing `aria-label` / `aria-expanded` | **Fixed** — Navbar |
| Contact form labels not associated with inputs | **Fixed** — `htmlFor` + `id` + `required` |
| Decorative icons announced by screen readers | **Fixed** — `aria-hidden` on key icons |
| Homepage sections missing landmarks/headings | **Fixed** — `aria-labelledby`, semantic `<article>` / `<blockquote>` |
| Footer social links with no accessible names | **Fixed** — `aria-label` per network |

---

## Performance & Mobile

| Area | Notes | Status |
|------|-------|--------|
| Font loading | Inter via `next/font` with `display: swap` | OK (existing) |
| Client components | Marketing pages use Framer Motion (client) | Acceptable — layouts are server for metadata |
| Responsive grids | `md:` / `lg:` breakpoints on all audited pages | OK |
| Mobile nav | Collapsible menu with scroll cap | OK |
| Image optimization | No heavy image assets on landing pages | OK |

**Recommendation (future):** Add `og-image.png` and `logo.png` to `public/` for social previews.

---

## Navigation Updates

- **Navbar:** Added Features, Testimonials, Integrations (in Product dropdown); removed broken Services-only path
- **Footer:** Added Features, Testimonials, Documentation; fixed social links; removed duplicate Changelog → Blog link

---

## Files Changed / Added

### New files

- `frontend/src/lib/marketing/seo.ts`
- `frontend/src/lib/marketing/blog-posts.ts`
- `frontend/src/components/marketing/JsonLd.tsx`
- `frontend/src/components/marketing/pages/HomePageContent.tsx`
- `frontend/src/components/marketing/pages/TestimonialsPageContent.tsx`
- `frontend/src/app/sitemap.ts`
- `frontend/src/app/robots.ts`
- `frontend/src/app/(marketing)/features/page.tsx` + `layout.tsx`
- `frontend/src/app/(marketing)/integrations/page.tsx` + `layout.tsx`
- `frontend/src/app/(marketing)/testimonials/page.tsx` + `layout.tsx`
- `frontend/src/app/(marketing)/blog/[slug]/page.tsx`
- Per-route `layout.tsx` for all marketing segments (metadata)

### Modified files

- `frontend/src/app/(marketing)/layout.tsx`
- `frontend/src/app/(marketing)/page.tsx`
- `frontend/src/app/(marketing)/services/page.tsx`
- `frontend/src/app/(marketing)/pricing/page.tsx`
- `frontend/src/app/(marketing)/blog/page.tsx`
- `frontend/src/app/(marketing)/contact/page.tsx`
- `frontend/src/components/marketing/Navbar.tsx`
- `frontend/src/components/marketing/Footer.tsx`

---

## Remaining Recommendations (not blocking)

1. Add real `public/og-image.png` and `public/logo.png` for OG/schema URLs
2. Wire contact form to backend API (currently UI-only submit)
3. Add `NEXT_PUBLIC_SITE_URL` to production `.env`
4. Consider lazy-loading Framer Motion on below-fold sections for LCP gains
5. Add FAQ schema on `/pricing` when FAQ section is expanded

---

## Fix Status Summary

| Category | Found | Fixed |
|----------|-------|-------|
| Critical SEO | 4 | 4 |
| Missing pages | 3 | 3 |
| Broken links | 9 | 9 |
| Accessibility | 6 | 6 |
| Structured data | 5 types missing | 5 added |
| Meta tags (routes) | 26+ pages | 26+ layouts |

**Overall:** All audited issues resolved. Marketing site is indexable, link-complete, and accessibility-improved.
