import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { rows: notifications } = await query(
      'SELECT * FROM "notifications" WHERE "userId" = $1 AND "isRead" = false ORDER BY "createdAt" DESC LIMIT 20',
      [user.sub]
    );
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
