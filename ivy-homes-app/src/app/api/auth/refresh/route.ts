import { NextResponse } from 'next/server';

const BASE_URL = 'https://solve.ivy.homes';

function apiKey() {
  const key = process.env.IVY_API_KEY;
  if (!key) throw new Error('IVY_API_KEY is not configured.');
  return key;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey() },
      body,
      cache: 'no-store',
    });

    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' },
    });
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : 'Session could not be refreshed.' }, { status: 500 });
  }
}
