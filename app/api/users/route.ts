import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const users = await prisma.user.findMany();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
