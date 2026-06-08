import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.role !== 'TEAM_LEADER') {
    return NextResponse.json({ error: 'Only TEAM_LEADER can request leadership' }, { status: 403 });
  }

  const { projectId } = await request.json();
  if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

  const existing = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.userId, projectId } },
  });
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 });

  const membership = await prisma.projectMember.create({
    data: { userId: session.userId, projectId, role: 'LEADER', status: 'PENDING' },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ membership }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only ADMIN can approve leader requests' }, { status: 403 });
  }

  const { projectId, userId, approve } = await request.json();
  if (!projectId || !userId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  if (approve) {
    await prisma.projectMember.update({
      where: { userId_projectId: { userId, projectId } },
      data: { status: 'ACTIVE' },
    });
    return NextResponse.json({ message: 'Leader approved' });
  } else {
    await prisma.projectMember.deleteMany({
      where: { userId, projectId, role: 'LEADER', status: 'PENDING' },
    });
    return NextResponse.json({ message: 'Leader request rejected' });
  }
}
