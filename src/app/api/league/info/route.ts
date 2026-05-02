import { NextResponse } from 'next/server';
import { LEAGUE_CONFIG } from '@/lib/utils';

export async function GET() {
  try {
    const leagueTiers = Object.entries(LEAGUE_CONFIG).map(([key, config]) => ({
      key,
      ...config,
    }));

    return NextResponse.json({ tiers: leagueTiers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch league info' }, { status: 500 });
  }
}
