import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';
import { recordAuditLog } from '@/lib/audit-log';

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

  await recordAuditLog({
    action: 'REQUESTED', entity: 'Liderazgo',
    detail: 'Solicitó ser líder del proyecto', userId: session.userId, projectId,
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
    await recordAuditLog({
      action: 'APPROVED', entity: 'Liderazgo',
      detail: 'Líder aprobado', userId: session.userId, projectId,
    });
    return NextResponse.json({ message: 'Leader approved' });
  } else {
    const rejected = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    await prisma.projectMember.deleteMany({
      where: { userId, projectId, role: 'LEADER', status: 'PENDING' },
    });
    await recordAuditLog({
      action: 'REJECTED', entity: 'Liderazgo',
      detail: `${rejected?.name || ''} rechazado como líder`, userId: session.userId, projectId,
    });
    return NextResponse.json({ message: 'Leader request rejected' });
  }
}
