import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', '..', 'scratch');
const listings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'listings.json'), 'utf8'));
const rentals = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'rentals.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'projects.json'), 'utf8'));

console.log('--- Quick Stats ---');
console.log('Listings retrievable:', listings.length);
console.log('Rentals retrievable:', rentals.length);
console.log('Projects retrievable:', projects.length);

const activeListings = listings.filter((l: any) => l.is_live);
console.log('Listings with is_live=true:', activeListings.length);
console.log('Listings with is_live=false:', listings.filter((l: any) => !l.is_live).length);
console.log('Listings with is_live=undefined:', listings.filter((l: any) => l.is_live === undefined).length);

const uniqueListingIds = new Set(listings.map((l: any) => l.listing_id));
const total_listing_records = listings.length;
console.log('Q1 total_listing_records:', total_listing_records);

// Q2: unique_properties
// Let's just group by (latitude, longitude, floor, carpet_area)
const propertySignatures = new Set();
for (const l of listings) {
  // Let's use coordinate precision of 4 decimals (approx 10 meters) just in case, but let's try exact first.
  const sig = `${l.latitude}_${l.longitude}_${l.floor}_${l.carpet_area}`;
  propertySignatures.add(sig);
}
console.log('Q2 unique_properties:', propertySignatures.size);

// Q3: active_listings
const active_listings = listings.filter((l: any) => l.is_live).length;
console.log('Q3 active_listings:', active_listings);

// Q4: corrupt_listing_ids
const corruptIds: string[] = [];
for (const l of listings) {
  if (l.floor > l.total_floors || l.carpet_area > l.super_built_up_area || l.price <= 0 || l.bedroom < 0) {
    corruptIds.push(l.listing_id);
  }
}
console.log('Q4 corrupt_listing_ids (count):', corruptIds.length);

// Q5: total_monthly_rent
const andheriRentals = rentals.filter((r: any) => r.locality && r.locality.toLowerCase() === 'andheri west');
const totalRent = andheriRentals.reduce((sum: number, r: any) => sum + r.price, 0);
console.log('Q5 total_monthly_rent:', totalRent);

// Q9: fake_listing_ids
// "Some of these listings are not real. They exist to generate enquiries."
// Often this means the posted_by_contact is identical for many listings under different names, 
// or the description is exactly the same, or the phone number belongs to too many "owners".
const contactToName = new Map<string, Set<string>>();
for (const l of listings) {
  if (!contactToName.has(l.posted_by_contact)) {
    contactToName.set(l.posted_by_contact, new Set());
  }
  contactToName.get(l.posted_by_contact)!.add(l.posted_by_name);
}

// Find contacts that have multiple different names associated with them
const fakeContacts = new Set<string>();
for (const [contact, names] of contactToName.entries()) {
  if (names.size > 1) { // Same phone number, different names -> suspicious!
    fakeContacts.add(contact);
  }
}
const fakeIds = listings.filter((l: any) => fakeContacts.has(l.posted_by_contact)).map((l: any) => l.listing_id).sort();
console.log('Q9 fake_listing_ids (count):', fakeIds.length);

// Q6: avg_price_per_sqft_2bhk
// "Across retrievable listing records where `is_live` is true and `bedroom` is 2, leaving out the records in your answers to 4 and 9: the mean of price divided by carpet area, in rupees per square foot, to 2 decimals."
const q6Listings = listings.filter((l: any) => 
  l.is_live === true && 
  l.bedroom === 2 && 
  !corruptIds.includes(l.listing_id) && 
  !fakeIds.includes(l.listing_id)
);
let sumPricePerSqft = 0;
for (const l of q6Listings) {
  sumPricePerSqft += (l.price / l.carpet_area);
}
const avg_price_per_sqft_2bhk = (sumPricePerSqft / q6Listings.length).toFixed(2);
console.log('Q6 avg_price_per_sqft_2bhk:', avg_price_per_sqft_2bhk);

// Q7: costliest_project
let maxPrice = -1;
let costliestProject = '';
for (const p of projects) {
  if (p.price_max > maxPrice) {
    maxPrice = p.price_max;
    costliestProject = p.project_id;
  }
}
console.log('Q7 costliest_project:', { project_id: costliestProject, price_max_inr: maxPrice });

// Q8: listings_last_7_days
let last7DaysCount = 0;
const refTime = new Date('2026-09-10T00:00:00+05:30').getTime();
const sevenDaysBefore = refTime - 7 * 24 * 60 * 60 * 1000;
for (const l of listings) {
  // Finding #6 proved posted_at is already in IST (no Z suffix, local time).
  // Parse as IST by appending the correct offset.
  const postedAt = new Date(l.posted_at + '+05:30').getTime();
  if (postedAt >= sevenDaysBefore && postedAt < refTime) {
    last7DaysCount++;
  }
}
console.log('Q8 listings_last_7_days:', last7DaysCount);

// Q10: projects_with_wrong_listing_count
// "Every project reports how many listings it has. For how many projects is that number wrong?"
const projectListingCounts: Record<string, number> = {};
// Wait, is it listings that are live, or all retrievable listings? "how many listings it has" -> all retrievable? Or just is_live?
// "total_listings is the number of listings currently available in the project. It is recomputed whenever a listing is added or withdrawn"
// withdrawn means is_live = false? Let's check with `is_live = true` first.
for (const l of listings) {
  if (l.project_id && l.is_live) {
    projectListingCounts[l.project_id] = (projectListingCounts[l.project_id] || 0) + 1;
  }
}
let wrongCountProjects = 0;
for (const p of projects) {
  const actualCount = projectListingCounts[p.project_id] || 0;
  if (p.total_listings !== actualCount) {
    wrongCountProjects++;
  }
}
console.log('Q10 projects_with_wrong_listing_count (is_live=true):', wrongCountProjects);

// Check if it matches with ALL listings
const projectListingCountsAll: Record<string, number> = {};
for (const l of listings) {
  if (l.project_id) {
    projectListingCountsAll[l.project_id] = (projectListingCountsAll[l.project_id] || 0) + 1;
  }
}
let wrongCountProjectsAll = 0;
for (const p of projects) {
  const actualCount = projectListingCountsAll[p.project_id] || 0;
  if (p.total_listings !== actualCount) {
    wrongCountProjectsAll++;
  }
}
console.log('Q10 projects_with_wrong_listing_count (all):', wrongCountProjectsAll);


