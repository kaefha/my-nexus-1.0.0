import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (res.rowCount === 0) {
      return NextResponse.json({ message: 'Email atau password salah' }, { status: 401 });
    }

    const user = res.rows[0];

    if (!user.is_active) {
      return NextResponse.json({ message: 'Account is inactive' }, { status: 401 });
    }

    if (user.password !== password) {
      return NextResponse.json({ message: 'Email atau password salah' }, { status: 401 });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = signToken(payload);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
