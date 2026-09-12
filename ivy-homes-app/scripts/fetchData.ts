import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://solve.ivy.homes';
const API_KEY = 'IVY26-DB796E086273';
const DATA_DIR = path.join(__dirname, '..', '..', 'scratch');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let authToken = '';

async function login() {
  console.log('Logging in...');
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY 
    },
    body: JSON.stringify({ email: 'demo1@ivy.homes', password: '3fa9fa6690' })
  });
  if (!res.ok) {
      const text = await res.text();
      throw new Error(`Login failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  authToken = data.access_token;
  console.log('Logged in successfully.');
}

async function fetchWithRetry(url: string, retries = 3, includeKey = true): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const headers: Record<string, string> = {};
      if (includeKey) headers['X-API-Key'] = API_KEY;
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}, statusText: ${res.statusText}`);
      }
      return await res.json();
    } catch (e: any) {
      console.log(`Failed to fetch ${url}, attempt ${i + 1}/${retries}: ${e.message}`);
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function fetchPaginatedData(endpoint: string, filename: string) {
  let allResults: any[] = [];
  let offset = 0;
  const limit = 50; // max limit is 50
  
  console.log(`Fetching ${endpoint}...`);
  while (true) {
    const url = `${BASE_URL}${endpoint}?offset=${offset}&limit=${limit}`;
    const data = await fetchWithRetry(url);
    
    if (data.results && Array.isArray(data.results)) {
      allResults = allResults.concat(data.results);
      console.log(`Fetched offset ${offset}, got ${data.results.length} results. Total so far: ${allResults.length}`);
      
      if (!data.has_more) {
          console.log(`Finished fetching ${endpoint}. Total: ${data.total}, Collected: ${allResults.length}`);
          break;
      }
    } else {
      console.log(`Warning: Unexpected response format for ${endpoint}`, data);
      break;
    }
    offset += limit;
  }

  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(allResults, null, 2));
  console.log(`Saved ${filename}`);
}

async function fetchSingleEndpoint(endpoint: string, filename: string, includeKey = true) {
  console.log(`Fetching ${endpoint}...`);
  const url = `${BASE_URL}${endpoint}`;
  try {
    const data = await fetchWithRetry(url, 3, includeKey);
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
    console.log(`Saved ${filename}`);
  } catch (e: any) {
    console.error(`Failed to fetch ${endpoint}:`, e.message);
  }
}

async function main() {
  await login();
  await fetchPaginatedData('/v1/listings', 'listings.json');
  await fetchPaginatedData('/v1/rentals', 'rentals.json');
  await fetchPaginatedData('/v1/projects', 'projects.json');
  
  await fetchSingleEndpoint('/v1/analytics/summary', 'analytics_summary.json');
  await fetchSingleEndpoint('/health', 'health.json', false);
}

main().catch(console.error);
