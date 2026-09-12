import { NextResponse } from 'next/server';

const API_KEY = process.env.IVY_API_KEY;
const BASE_URL = 'https://solve.ivy.homes';

// In-memory cache
let cachedListings: any[] = [];
let lastFetchTime = 0;

async function getAllListings(authHeader: string) {
  if (!API_KEY) throw new Error('IVY_API_KEY is not configured.');
  // Cache for 5 minutes
  if (cachedListings.length > 0 && Date.now() - lastFetchTime < 5 * 60 * 1000) {
    return cachedListings;
  }
  
  cachedListings = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const res = await fetch(`${BASE_URL}/v1/listings?limit=50&offset=${offset}`, {
      headers: {
        'X-API-Key': API_KEY,
        'Authorization': authHeader
      }
    });
    
    if (!res.ok) {
      if (cachedListings.length > 0) return cachedListings; // fallback to partial if failed
      throw new Error('Failed to fetch listings');
    }
    
    const data = await res.json();
    cachedListings.push(...data.results);
    hasMore = data.has_more;
    offset += 50;
  }
  
  lastFetchTime = Date.now();
  return cachedListings;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const params = await context.params;
    const allListings = await getAllListings(authHeader);
    const listing = allListings.find(l => l.listing_id === params.id);
    
    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
