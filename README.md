# Ivy Homes Assignment - Kshitij Gautam

This repository contains the solution for the Ivy Homes engineering assignment.

## Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS

## Requirements Met

### 1. Data Analysis (`submission.json`)
- Analysed the API to find discrepancies ("lies") in the documentation
- Identified all paginated listing records, distinct properties, fake listings, and corrupt properties
- Extracted and computed various market insights

### 2. Web Frontend
- **Login**: Fully functional login using the real API credentials. Session tokens are properly stored.
- **Token Refresh**: Next.js API client intercepts `401 Unauthorized` responses and seamlessly performs a background token refresh via `/auth/refresh` to ensure the session outlives the 15-minute token expiry.
- **Listings Browser**: Paginated UI to browse properties, with filters for locality, BHK, price range, and furnishing fully implemented and verified.
- **Listing Details**: Dedicated page for individual listings (`/listings/[id]`), implemented via an API route that queries the list and caches the results to avoid scanning 100+ pages synchronously.
- **Saved Listings**: Implemented using `localStorage` keyed by user email so it persists through refresh and login/logout cycles.
- **Rentals & Projects**: Dedicated pages for rentals and builder projects displaying accurate statistics and price representations (e.g., Crores correctly formatted).
- **Insights Screen**: A dashboard that performs complex aggregations on the `is_live=true` listings in the browser since `/v1/analytics/summary` is missing.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The application is deployed on Vercel and can be accessed at:
[https://ivy-assignment.vercel.app](https://ivy-assignment.vercel.app)
