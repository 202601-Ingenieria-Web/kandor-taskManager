import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId, userId: targetUserId, approve } = await request.json();

  if (!projectId || !targetUserId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.userId, projectId } },
  });
  const isLeader = membership?.role === 'LEADER' && membership?.status === 'ACTIVE';
  const isAdmin = session.role === 'ADMIN';

  if (!isLeader && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (approve) {
    await prisma.projectMember.deleteMany({
      where: { userId: targetUserId, projectId },
    });
    await prisma.taskAssignment.deleteMany({
      where: { userId: targetUserId, task: { projectId } },
    });
    return NextResponse.json({ message: 'Leave approved, member removed and tasks unassigned' });
  } else {
    await prisma.projectMember.update({
      where: { userId_projectId: { userId: targetUserId, projectId } },
      data: { status: 'ACTIVE' },
    });
    return NextResponse.json({ message: 'Leave request rejected' });
  }
}

export async function POST(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = await request.json();
  if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.userId, projectId } },
  });
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 404 });

  if (membership.role === 'LEADER') {
    await prisma.projectMember.deleteMany({ where: { userId: session.userId, projectId } });
    return NextResponse.json({ message: 'Left project' });
  }

  await prisma.projectMember.update({
    where: { userId_projectId: { userId: session.userId, projectId } },
    data: { status: 'LEAVE_REQUESTED' },
  });

  return NextResponse.json({ message: 'Leave request sent to leader' });
}
