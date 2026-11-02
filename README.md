# Fyndr web (TypeScript rebuild) - Part 1 of 3

Vite + React 18 + TypeScript (strict). No router or state libraries: a 60-line hash router keeps the old `#/` URLs working.

## Run it
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
```

## What is in Part 1
- **Design system** (`src/styles/`): tokens, light and dark theme, one typeface (Schibsted Grotesk). Job = cobalt, internship = amber, course = teal.
- **Shell**: header with nav, saved count and theme toggle; footer; skip link; focus moves to the page on navigation.
- **Home**: the search box is the hero. Results update as you type, with live counts per kind.
- **Jobs / Internships / Courses / Browse**: field, place and free-only filters, address bar stays in step (shareable searches), "show more" paging.
- **Saved**: stored on the device under the same key as the old site, so existing saved items carry over.
- **Typed data layer** (`src/lib/`): `meta.ts` (45 course sites, 17 job boards, URLs unchanged), `group.ts` (rows to one listing per topic or role-in-city, same stable ids as before), `catalog.ts` (load + search), `saved.ts`, `theme.ts`.

Verified against your real catalog files: 3,090 listings (1,350 courses, 1,740 job and internship cards, 17 cities).

## Honest note kept from the old site
Catalog cards are search links. Each button opens another site's own search page, and Fyndr has not checked the postings there. The UI says so in the footer and in every expanded card.

## Coming next
- **Part 2**: sign in (email and phone), profile, "For you" matching, dashboards, apply, organizations (Firebase).
- **Part 3**: Library, Community, Groups, legal pages, PWA/offline, SEO, and wiring the production build into your Node server and Firebase hosting.

Your existing backend (`server/`, `functions/`, `firestore.rules`, `scripts/`, `config/`) is untouched. This folder sits beside it.
