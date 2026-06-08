import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = await request.json();
  if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

  await prisma.projectMember.deleteMany({
    where: { userId: session.userId, projectId },
  });

  return NextResponse.json({ message: 'Left project' });
}
