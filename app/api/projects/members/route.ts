import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId, userId, action } = await request.json();

  if (!projectId || !userId || !action) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.userId, projectId } },
  });

  const isAdmin = session.role === 'ADMIN';
  const isLeader = membership?.role === 'LEADER' && membership?.status === 'ACTIVE';

  if (!isAdmin && !isLeader) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (action === 'add') {
    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 });

    const member = await prisma.projectMember.create({
      data: { userId, projectId, role: 'MEMBER', status: 'ACTIVE' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json({ member }, { status: 201 });
  }

  if (action === 'remove') {
    if (userId === session.userId) {
      return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
    }
    await prisma.projectMember.deleteMany({
      where: { userId, projectId },
    });
    return NextResponse.json({ message: 'Member removed' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
