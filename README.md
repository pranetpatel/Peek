# Peek

A dating app focused on personality, hobby, and values-based matching. Built with Next.js, Supabase, and Drizzle ORM.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Demo mode (development only)

Demo mode signs you in as a seeded fake account so every feature can be exercised
without creating a real Supabase user or uploading real photos. It's on in `next dev`
and on Vercel preview/branch deployments. The production domain is off unless you set
`NEXT_PUBLIC_ENABLE_DEMO=true` (and `=false` force-disables it anywhere).

- Open [/demo](http://localhost:3000/demo), or use the "Enter demo mode" link under the
  sign-in / sign-up forms.
- Personas: **Ava** (fully set up, pre-existing matches and chat history), **Ben**
  (onboarded, no matches — empty states), **Fresh account** (drops into onboarding step one).
- Everything except Supabase is real: profiles, likes, matches and messages are ordinary
  Postgres rows, so only `DATABASE_URL` is required. Auth is a cookie naming the persona,
  and photos are generated SVGs served from `/demo/avatar`.
- Demo rows all use fixed `de300000-…` ids. "Reset demo data" on the panel (or
  `npm run demo:seed`) deletes every like/match/message involving them and re-seeds the
  scripted starting state. Real accounts are never touched.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
