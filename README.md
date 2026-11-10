# Yididya.me — full website starter

A responsive React + TypeScript + Tailwind website with portfolio, projects, learning, blog, services, contact, and a direct-donation charity directory.

## Run locally
1. Install Node.js (LTS) from https://nodejs.org/
2. Extract this folder.
3. Open a terminal in this folder.
4. Run `npm install`
5. Run `npm run dev`
6. Open the local URL printed by Vite.

## Build
Run `npm run build`. The production website is created in `dist/`.

## Deploy to Netlify
1. Push this project to a GitHub repository.
2. In Netlify, choose **Add new site → Import an existing project**.
3. Select your GitHub repository.
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy. `netlify.toml` already includes these settings.

## Charity and backend status
The charity directory currently uses clearly labelled demonstration entries stored locally in `src/data.ts`. It does not collect, process, or hold donations. A campaign owner can be contacted directly using the contact details shown on a real, approved campaign. Do not add real bank details until the account holder has explicitly consented and the campaign organiser and authority have been checked.

For live campaign submissions, admin authentication, file uploads, and database storage, connect a Supabase project:
1. Create a project at https://supabase.com/
2. Copy its Project URL and anon/public key into a local `.env` file using `.env.example`.
3. Review `supabase/schema.sql` and run it in Supabase SQL Editor.
4. Add proper Row Level Security policies and an admin role before accepting public submissions.
5. Never put a Supabase service-role key in frontend code.

This codebase includes the Supabase client foundation, but the public campaign-submission and admin workflows are intentionally not activated until backend security and moderation are configured.

## Important content checks before launch
- Confirm every personal statement and education status.
- Replace demo project descriptions with accurate details.
- Add only real work, screenshots, and links.
- Publish a privacy policy and terms suitable for your actual operation.
- Confirm legal requirements for publishing fundraising campaigns in Ethiopia.
- Keep verification labels truthful. Never call a campaign verified without completing checks.

## Main routes
`/` `/about` `/technology` `/projects` `/learning` `/blog` `/services` `/charity` `/contact` `/privacy` `/terms`
