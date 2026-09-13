import { NextResponse } from 'next/server';
import { getAllListings } from '@/lib/ivy-server';

const API_KEY = process.env.IVY_API_KEY || 'IVY26-DB796E086273';
const BASE_URL = 'https://solve.ivy.homes';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const idsParam = url.searchParams.get('ids');
  if (!idsParam) return NextResponse.json([]);
  
  const ids = idsParam.split(',');

  try {
    const allListings = await getAllListings(authHeader);
    const results = allListings.filter(l => ids.includes(l.listing_id));
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
