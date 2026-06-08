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

  const existing = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.userId, projectId } },
  });

  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 });

  const membership = await prisma.projectMember.create({
    data: { userId: session.userId, projectId, role: 'MEMBER', status: 'ACTIVE' },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ membership }, { status: 201 });
}
