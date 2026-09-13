import { NextResponse } from 'next/server';
import { browseAuthorization, ivyApiKey, getAllListings } from '@/lib/ivy-server';

const BASE_URL = 'https://solve.ivy.homes';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const allListings = await getAllListings(request.headers.get('Authorization') ?? await browseAuthorization());
    const listing = allListings.find(l => l.listing_id === params.id);
    
    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
