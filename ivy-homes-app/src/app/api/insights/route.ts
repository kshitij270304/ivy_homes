import { NextResponse } from 'next/server';
import { browseAuthorization, ivyApiKey } from '@/lib/ivy-server';

const BASE_URL = 'https://solve.ivy.homes';

let cachedListings: any[] = [];
let lastFetchTime = 0;

async function getAllListings(authHeader: string) {
  const apiKey = ivyApiKey();
  if (cachedListings.length > 0 && Date.now() - lastFetchTime < 5 * 60 * 1000) {
    return cachedListings;
  }
  
  cachedListings = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const res = await fetch(`${BASE_URL}/v1/listings?limit=50&offset=${offset}`, {
      headers: { 'X-API-Key': apiKey, 'Authorization': authHeader }
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
  const authorization = request.headers.get('Authorization') ?? await browseAuthorization();

  try {
    const listings = await getAllListings(authorization);
    
    const activeListings = listings.filter(l => l.is_live);
    const inactiveListings = listings.filter(l => !l.is_live);
    const totalInventoryValue = activeListings.reduce((sum, l) => sum + (l.price || 0), 0);
    const avgPricePerSqft = activeListings.reduce((sum, l) => sum + ((l.price || 0) / (l.carpet_area || 1)), 0) / (activeListings.length || 1);
    
    // Median price
    const sortedPrices = activeListings.map(l => l.price).filter(Boolean).sort((a: number, b: number) => a - b);
    const medianPrice = sortedPrices.length > 0
      ? sortedPrices.length % 2 === 0
        ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
        : sortedPrices[Math.floor(sortedPrices.length / 2)]
      : 0;

    // Median price per sqft
    const priceSqftValues = activeListings
      .filter(l => l.price > 0 && l.carpet_area > 0)
      .map(l => l.price / l.carpet_area)
      .sort((a: number, b: number) => a - b);
    const medianPricePerSqft = priceSqftValues.length > 0
      ? priceSqftValues.length % 2 === 0
        ? (priceSqftValues[priceSqftValues.length / 2 - 1] + priceSqftValues[priceSqftValues.length / 2]) / 2
        : priceSqftValues[Math.floor(priceSqftValues.length / 2)]
      : 0;

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

    // By locality (top 10)
    const localityMap: Record<string, { count: number; prices: number[] }> = {};
    activeListings.forEach((l: any) => {
      const loc = l.locality || 'unknown';
      if (!localityMap[loc]) localityMap[loc] = { count: 0, prices: [] };
      localityMap[loc].count++;
      if (l.price > 0) localityMap[loc].prices.push(l.price);
    });
    const byLocality = Object.entries(localityMap)
      .map(([locality, data]) => {
        const sorted = data.prices.sort((a, b) => a - b);
        const median = sorted.length > 0
          ? sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)]
          : 0;
        return { locality, count: data.count, median_price: median };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // --- Data Discoveries ---

    // Corrupt listings
    const corruptListings = listings.filter((l: any) => {
      return l.price < 0 || l.carpet_area < 0 || l.super_built_up_area < 0
        || (l.floor > l.total_floors && l.total_floors > 0)
        || (l.carpet_area > 0 && l.super_built_up_area > 0 && l.carpet_area > l.super_built_up_area * 1.5)
        || l.bedroom <= 0;
    });

    // Fake listings: phone numbers tied to multiple broker names
    const contactNameMap: Record<string, Set<string>> = {};
    listings.forEach((l: any) => {
      if (l.posted_by_contact && l.posted_by_name) {
        if (!contactNameMap[l.posted_by_contact]) contactNameMap[l.posted_by_contact] = new Set();
        contactNameMap[l.posted_by_contact].add(l.posted_by_name);
      }
    });
    const suspiciousContacts = Object.entries(contactNameMap)
      .filter(([, names]) => names.size >= 3)
      .map(([phone, names]) => ({ phone, names: Array.from(names), count: names.size }))
      .sort((a, b) => b.count - a.count);
    const fakeListingCount = listings.filter((l: any) => {
      const names = contactNameMap[l.posted_by_contact];
      return names && names.size >= 3;
    }).length;

    // Duplicates
    const propertyGroups: Record<string, any[]> = {};
    listings.forEach((l: any) => {
      const key = `${l.apartment_name || ''}_${l.floor}_${l.carpet_area}_${l.bedroom}_${l.locality}`;
      if (!propertyGroups[key]) propertyGroups[key] = [];
      propertyGroups[key].push(l);
    });
    const duplicateGroups = Object.values(propertyGroups).filter(g => g.length > 1 && g.some(a => g.some(b => a.website !== b.website)));

    return NextResponse.json({
      city: 'mumbai',
      total_listings: listings.length,
      total_active_listings: activeListings.length,
      total_inactive_listings: inactiveListings.length,
      total_inventory_value_cr: (totalInventoryValue / 10000000).toFixed(2),
      avg_price_per_sqft: avgPricePerSqft.toFixed(2),
      median_price: medianPrice,
      median_price_per_sqft: Math.round(medianPricePerSqft),
      bhk_distribution: Object.entries(bhkDistribution).map(([k, v]) => ({ name: `${k} BHK`, value: v })),
      property_type_distribution: Object.entries(propertyTypeDistribution).map(([k, v]) => ({ name: k, value: v })),
      by_locality: byLocality,
      discoveries: {
        corrupt_listings_count: corruptListings.length,
        corrupt_examples: corruptListings.slice(0, 10).map((l: any) => ({
          listing_id: l.listing_id,
          issue: l.price < 0 ? 'Negative price' : l.carpet_area < 0 ? 'Negative area' : l.floor > l.total_floors ? `Floor ${l.floor} > total ${l.total_floors}` : l.bedroom <= 0 ? 'Zero bedrooms' : 'Area inversion'
        })),
        fake_listings_count: fakeListingCount,
        suspicious_broker_rings: suspiciousContacts.slice(0, 5).map(c => ({
          phone: c.phone,
          aliases: c.names.slice(0, 5),
          alias_count: c.count
        })),
        duplicate_property_groups: duplicateGroups.length,
        inactive_served: inactiveListings.length,
        inactive_note: 'Documentation claims inactive listings are excluded server-side, but API returns them',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
