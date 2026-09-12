import { NextResponse } from 'next/server';
import { browseAuthorization, ivyApiKey } from '@/lib/ivy-server';

const BASE_URL = 'https://solve.ivy.homes';

function allowedPath(path: string) {
  return path === 'v1/listings'
    || path === 'v1/rentals'
    || path === 'v1/projects'
    || path === 'v1/saved'
    || /^v1\/saved\/[^/]+$/.test(path);
}

async function forward(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    const endpoint = path.join('/');
    if (!allowedPath(endpoint)) return NextResponse.json({ detail: 'Unsupported API path.' }, { status: 404 });

    const incomingUrl = new URL(request.url);
    const headers = new Headers();
    headers.set('X-API-Key', ivyApiKey());
    headers.set('Accept', 'application/json');
    const authorization = request.headers.get('Authorization');
    if (endpoint.startsWith('v1/saved') && !authorization) {
      return NextResponse.json({ detail: 'Sign in to manage saved properties.' }, { status: 401 });
    }
    headers.set('Authorization', authorization ?? await browseAuthorization());
    const contentType = request.headers.get('Content-Type');
    if (contentType) headers.set('Content-Type', contentType);

    const response = await fetch(`${BASE_URL}/${endpoint}${incomingUrl.search}`, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
      cache: 'no-store',
    });

    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' },
    });
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : 'The property service is unavailable.' }, { status: 500 });
  }
}

export const GET = forward;
export const POST = forward;
export const DELETE = forward;
