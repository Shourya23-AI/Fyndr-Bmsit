# Fyndr web (Vite + React + TypeScript)

    npm install
    npm run dev      # http://localhost:5173 (API proxied to http://localhost:3000)
    npm run build    # type-check + production build into dist/

Brand assets live in public/brand (logo mark, hero, card art, favicon, app icons), cut from the reference board.
Change the site name in src/components/Logo.tsx (BRAND and the wordmark).

Part 3 adds: Library (src/pages/LibraryPage.tsx, src/data/resources.ts, src/lib/books.ts), Community and Groups (src/lib/db.ts talks to Firestore, rules in the server repo's firestore.rules), legal pages, SEO (src/lib/seo.ts) and route transitions (.route in skin.css).
