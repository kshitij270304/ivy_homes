import { NextResponse } from 'next/server';

const API_KEY = process.env.IVY_API_KEY;
const BASE_URL = 'https://solve.ivy.homes';

let cachedListings: any[] = [];
let lastFetchTime = 0;

async function getAllListings(authHeader: string) {
  if (!API_KEY) throw new Error('IVY_API_KEY is not configured.');
  if (cachedListings.length > 0 && Date.now() - lastFetchTime < 5 * 60 * 1000) {
    return cachedListings;
  }
  
  cachedListings = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const res = await fetch(`${BASE_URL}/v1/listings?limit=50&offset=${offset}`, {
      headers: { 'X-API-Key': API_KEY, 'Authorization': authHeader }
    });
    
    if (!res.ok) {
      if (cachedListings.length > 0) return cachedListings;
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

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const listings = await getAllListings(authHeader);
    
    const activeListings = listings.filter(l => l.is_live);
    const totalInventoryValue = activeListings.reduce((sum, l) => sum + (l.price || 0), 0);
    const avgPricePerSqft = activeListings.reduce((sum, l) => sum + ((l.price || 0) / (l.carpet_area || 1)), 0) / (activeListings.length || 1);
    
    // Group by BHK
    const bhkDistribution = activeListings.reduce((acc: any, l) => {
      const bhk = l.bedroom > 4 ? '4+' : l.bedroom.toString();
      acc[bhk] = (acc[bhk] || 0) + 1;
      return acc;
    }, {});
    
    // Group by property type
    const propertyTypeDistribution = activeListings.reduce((acc: any, l) => {
      acc[l.property_type] = (acc[l.property_type] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      total_active_listings: activeListings.length,
      total_inventory_value_cr: (totalInventoryValue / 10000000).toFixed(2),
      avg_price_per_sqft: avgPricePerSqft.toFixed(2),
      bhk_distribution: Object.entries(bhkDistribution).map(([k, v]) => ({ name: `${k} BHK`, value: v })),
      property_type_distribution: Object.entries(propertyTypeDistribution).map(([k, v]) => ({ name: k, value: v }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
