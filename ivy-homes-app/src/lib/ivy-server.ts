import 'server-only';

const BASE_URL = 'https://solve.ivy.homes';
let browseAccessToken: string | null = null;
let browseTokenExpiresAt = 0;

export function ivyApiKey() {
  const key = process.env.IVY_API_KEY;
  if (!key) throw new Error('IVY_API_KEY is not configured.');
  return key;
}

export async function browseAuthorization() {
  if (browseAccessToken && Date.now() < browseTokenExpiresAt) {
    return `Bearer ${browseAccessToken}`;
  }

  const email = process.env.IVY_DEMO_EMAIL;
  const password = process.env.IVY_DEMO_PASSWORD;
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
