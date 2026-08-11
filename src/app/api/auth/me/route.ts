import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const jwtUser = getUserFromRequest(req);
    if (!jwtUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { rows } = await query(
      'SELECT id, email, name, role, phone, avatar, "isActive", "createdAt" FROM "users" WHERE id = $1',
      [jwtUser.sub]
    );
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
