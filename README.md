# Fyndr web (TypeScript) - Part 2

Vite + React + TypeScript. Part 2 adds accounts and the signed-in pages on top of Part 1.

## Run it
1. Start your existing Fyndr server (`node server.js` in the old repo, port 3000).
2. In this folder: `npm install`, then `npm run dev`.
   Vite forwards `/api` to the server, so sign-in, profile, apply and the dashboards work locally.
3. `npm run build` to make the production build in `dist/`.

Copy `.env.example` to `.env` only if the server is on another address or port.

## What Part 2 adds
- Sign in, register (candidate or organization), forgot password, Google sign-in, email verification, first-time setup.
- Phone verification with phone.email (popup, or same-tab on phones and Firefox). `public/phone-callback.*` is included.
- Profile: education, skills, job types, places, summary, projects, photo, PDF resume. Saving keeps the resume details the old site stored.
- Dashboard for candidates: For you (ranked matches, learning roadmap, profile tips), Applications, Profile.
- Apply page for roles posted on Fyndr, with the Fyndr resume or your own PDF.
- Dashboard for organizations: post a listing (cover image and logo), listings, applicants, status changes, resume view.
- For organizations page, and an account menu in the header.

## Not done yet (Part 3)
Library, Community, Groups, legal pages, admin and moderator tools, offline support, SEO, and listings posted by organizations inside Browse. Saved items for signed-in users still live on the device.

## Notes
- Uses the same server API and Firebase project as the old site. The server is unchanged.
- "For you" runs in the browser against the built-in catalog. It does not read resumes and uses no AI.
- Not run in a browser here: this build had no internet, so `npm install` and `npm run build` were not run.
