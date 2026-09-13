import { NextResponse } from 'next/server';
import { browseAuthorization, ivyApiKey } from '@/lib/ivy-server';

const BASE_URL = 'https://solve.ivy.homes';
const PAGE_SIZE = 50;
const CACHE_MS = 5 * 60 * 1000;

let cachedListings: Record<string, unknown>[] = [];
let lastFetchTime = 0;

async function getAllListings(authorization: string) {
  if (cachedListings.length && Date.now() - lastFetchTime < CACHE_MS) return cachedListings;

  const listings: Record<string, unknown>[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${BASE_URL}/v1/listings?offset=${offset}&limit=${PAGE_SIZE}`, {
      headers: { 'X-API-Key': ivyApiKey(), Authorization: authorization },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Unable to retrieve listings.');

    const data = await response.json();
    listings.push(...(data.results ?? []));
    hasMore = data.has_more === true;
    offset += PAGE_SIZE;
  }

  cachedListings = listings;
  lastFetchTime = Date.now();
  return listings;
}

export async function GET(request: Request) {
  const authorization = request.headers.get('Authorization') ?? await browseAuthorization();

  try {
    const params = new URL(request.url).searchParams;
    const locality = params.get('locality')?.trim().toLowerCase();
    const furnishing = params.get('furnishing')?.trim().toLowerCase();
    const bhk = Number(params.get('bhk'));
    const minPrice = Number(params.get('min_price'));
    const maxPrice = Number(params.get('max_price'));
    const offset = Math.max(Number(params.get('offset')) || 0, 0);
    const limit = Math.min(Math.max(Number(params.get('limit')) || PAGE_SIZE, 1), PAGE_SIZE);

    const matching = (await getAllListings(authorization)).filter((listing) => {
      const price = Number(listing.price);
      return listing.is_live === true
        && (!locality || String(listing.locality).toLowerCase().includes(locality))
        && (!furnishing || String(listing.furnishing).toLowerCase() === furnishing)
        && (!Number.isFinite(bhk) || bhk === 0 || Number(listing.bedroom) === bhk)
        && (!Number.isFinite(minPrice) || minPrice === 0 || price >= minPrice)
        && (!Number.isFinite(maxPrice) || maxPrice === 0 || price <= maxPrice);
    });

    return NextResponse.json({
      results: matching.slice(offset, offset + limit),
      offset,
      limit,
      count: matching.length,
      total: matching.length,
      has_more: offset + limit < matching.length,
    });
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : 'Unable to search listings.' }, { status: 500 });
  }
}
