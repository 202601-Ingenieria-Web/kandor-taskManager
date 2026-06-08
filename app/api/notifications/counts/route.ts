import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET() {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = session.role as string;
  let leaveRequests = 0;
  let proposals = 0;
  let leaderRequests = 0;

  if (role === 'ADMIN') {
    proposals = await prisma.project.count({ where: { deleted: false, status: 'DRAFT' } });
    leaderRequests = await prisma.projectMember.count({
      where: { role: 'LEADER', status: 'PENDING' },
    });
    leaveRequests = await prisma.projectMember.count({
      where: { status: 'LEAVE_REQUESTED' },
    });
  } else if (role === 'TEAM_LEADER') {
    const ledProjectIds = await prisma.projectMember.findMany({
      where: { userId: session.userId, role: 'LEADER', status: 'ACTIVE' },
      select: { projectId: true },
    });
    const ids = ledProjectIds.map((m) => m.projectId);
    if (ids.length > 0) {
      leaveRequests = await prisma.projectMember.count({
        where: { projectId: { in: ids }, status: 'LEAVE_REQUESTED' },
      });
    }
  }

  return NextResponse.json({ leaveRequests, proposals, leaderRequests });
}
