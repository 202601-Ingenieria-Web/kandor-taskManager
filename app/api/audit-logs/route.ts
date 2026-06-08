import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get('userId');

  const isAdmin = session.role === 'ADMIN';
  const isTeamLeader = session.role === 'TEAM_LEADER';

  let visibleUserIds: string[];

  if ((isAdmin || isTeamLeader) && targetUserId) {
    visibleUserIds = [targetUserId];
  } else if (isAdmin) {
    visibleUserIds = [];
  } else if (isTeamLeader) {
    const ledProjects = await prisma.projectMember.findMany({
      where: { userId: session.userId, role: 'LEADER', status: 'ACTIVE' },
      select: { projectId: true },
    });
    const projectIds = ledProjects.map((p) => p.projectId);
    const memberIds = (await prisma.projectMember.findMany({
      where: { projectId: { in: projectIds }, status: 'ACTIVE' },
      select: { userId: true },
    })).map((m) => m.userId);
    visibleUserIds = [...new Set([session.userId, ...memberIds])];
  } else {
    visibleUserIds = [session.userId];
  }

  const where: Record<string, unknown> = {};
  if (targetUserId && (isAdmin || isTeamLeader)) {
    where.userId = targetUserId;
  } else if (isAdmin) {
  } else {
    where.userId = { in: visibleUserIds };
  }

  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ logs });
}
