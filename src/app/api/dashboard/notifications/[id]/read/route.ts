import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;

    const { rows } = await query(
      'UPDATE "notifications" SET "isRead" = true WHERE id = $1 RETURNING *',
      [resolvedParams.id]
    );
    const updated = rows[0];
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
