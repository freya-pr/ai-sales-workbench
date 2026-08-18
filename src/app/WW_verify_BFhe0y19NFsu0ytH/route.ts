import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export function GET() {
  return new NextResponse('BFhe0y19NFsu0ytH', {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
    },
  });
}
