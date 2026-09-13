import 'server-only';

const BASE_URL = 'https://solve.ivy.homes';
let browseAccessToken: string | null = null;
let browseTokenExpiresAt = 0;

export function ivyApiKey() {
  const key = process.env.IVY_API_KEY || 'IVY26-DB796E086273';
  if (!key) throw new Error('IVY_API_KEY is not configured.');
  return key;
}

export async function browseAuthorization() {
  if (browseAccessToken && Date.now() < browseTokenExpiresAt) {
    return `Bearer ${browseAccessToken}`;
  }

  const email = process.env.IVY_DEMO_EMAIL || 'demo1@ivy.homes';
  const password = process.env.IVY_DEMO_PASSWORD || '3fa9fa6690';
  if (!email || !password) {
    throw new Error('IVY_DEMO_EMAIL and IVY_DEMO_PASSWORD are required for public browsing.');
  }

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': ivyApiKey() },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Unable to create a browsing session.');

  const data = await response.json();
  if (!data.access_token) throw new Error('The browsing session did not include an access token.');
  browseAccessToken = data.access_token;
  browseTokenExpiresAt = Date.now() + Math.max((Number(data.expires_in) || 900) - 30, 30) * 1000;
  return `Bearer ${browseAccessToken}`;
}


let cachedListings: any[] = [];
let lastFetchTime = 0;

export async function getAllListings(authHeader: string) {
  if (cachedListings.length > 0 && Date.now() - lastFetchTime < 5 * 60 * 1000) {
    return cachedListings;
  }
  
  const apiKey = ivyApiKey();
  const allListings = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const batchOffsets = Array.from({ length: 20 }, (_, i) => offset + i * 50);
    const responses = await Promise.all(
      batchOffsets.map(off => 
        fetch(`${BASE_URL}/v1/listings?limit=50&offset=${off}`, {
          headers: { 'X-API-Key': apiKey, 'Authorization': authHeader },
          cache: 'no-store'
        }).then(r => r.ok ? r.json() : null).catch(() => null)
      )
    );
    
    let batchHadData = false;
    for (const data of responses) {
      if (data && data.results && data.results.length > 0) {
        allListings.push(...data.results);
        batchHadData = true;
        if (!data.has_more) hasMore = false;
      } else {
        hasMore = false;
      }
    }
    
    if (!batchHadData) break;
    offset += 20 * 50;
  }
  
  const unique = Array.from(new Map(allListings.map((l: any) => [l.listing_id, l])).values());
  if (unique.length > 0) {
    cachedListings = unique;
    lastFetchTime = Date.now();
  }
  return cachedListings;
}
