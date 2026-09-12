# Ivy Homes Assignment - Kshitij Gautam

This repository contains the solution for the Ivy Homes engineering assignment.

> **AI Disclosure:** As permitted by the rules, I used an AI coding assistant (Antigravity/DeepMind) for assistance with scaffolding the Next.js app, generating Tailwind UI components, drafting the data-fetching scripts, and conducting parts of the automated data analysis.

## Tech Stack
- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4

## How to Run It

1. Change directory to the Next.js app:
```bash
cd ivy-homes-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How I Worked Out Which Parts of the Documentation to Distrust

I adopted a "trust but verify" approach. First, I pulled the entire dataset using a standalone Node.js script. During extraction, I immediately hit auth and pagination roadblocks: passing the API key via query parameters returned a 401, and passing `page` parameters caused an infinite loop fetching identical data. By inspecting the actual JSON response headers and bodies, I deduced that `X-API-Key` and `offset` were required instead.

For the data quality issues, I wrote analysis scripts (`scripts/analyzeData.ts`) to validate the dataset's logical bounds. I grouped listings by coordinates to find impossible geographical locations (e.g. coordinates mapping to the Arctic instead of Mumbai). I grouped records by phone numbers to find contacts associated with multiple distinct broker names, revealing the "bait-and-switch" fraud rings. When my script caught `price_max` values like `12.44` for projects, I knew this had to be Crores rather than Rupees to logically make sense in the real estate domain. 

For the missing endpoints (like `/v1/analytics/summary`), I built robust fallback mechanisms in my Next.js API routes that performed these aggregations on-the-fly using the cached raw dataset.

## What I Checked That Turned Out to Be Fine

I started with several hypotheses of potential "lies" that ultimately turned out to be false alarms:

1. **Missing Data Fields**: I suspected many listings would lack crucial fields (like `carpet_area` or `price`) despite the docs saying they were guaranteed. However, after iterating through all 5100 records, the core structural fields were impressively complete, except for the intentionally corrupt ones.
2. **Server-Side Filtering**: Given how the `project_id` filter was completely ignored by the API, I hypothesized that ALL filters (`locality`, `bhk`, `min_price`, `furnishing`) were fundamentally broken and required full client-side implementation. However, upon testing, I discovered that these specific filters *actually work flawlessly* on the server. My Next.js frontend utilizes them directly to reduce payload size.
3. **Property Deduplication by Name**: I hypothesized that listings with identical `apartment_name` fields were always duplicates. It turned out to be a dead end: many distinct, legitimate properties share generic apartment names within the same complex but represent entirely different units on different floors. I refined my duplicate-detection heuristic to require matching `floor` and `carpet_area` in addition to the project identifier.
4. **JWT Decoding**: I thought I would need to decode the `access_token` JWT to get the user's details for the "Saved" listings feature. It turned out the API generously returns the user object explicitly in the `/auth/login` payload, making client-side persistence much easier.

## What I Would Do With Another Two Days

1. **Database Persistence**: Swap out `localStorage` for a proper database (like PostgreSQL with Prisma) to store user sessions and wishlist items, allowing users to access their saved properties across different devices.
2. **Advanced Analytics Visualizations**: Replace my rudimentary HTML bar charts on the Insights screen with an interactive charting library like Recharts or Chart.js, allowing the user to drill down into specific localities or price distributions.
3. **Map Integration**: Integrate Google Maps or Mapbox on the Listing Details page using the `lat` and `lng` coordinates to give users a spatial understanding of the properties.
4. **Server-Side Rendering & Caching Improvements**: Since the external API is largely static, I would implement robust Next.js ISR (Incremental Static Regeneration) on the listings and projects pages, caching them at the Edge to eliminate loading spinners entirely.
