import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { rows } = await query(
      'SELECT count(*) as count FROM "notifications" WHERE "userId" = $1 AND "isRead" = false',
      [user.sub]
    );
    const count = parseInt(rows[0]?.count || '0', 10);
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
