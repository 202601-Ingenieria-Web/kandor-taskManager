import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';

const projectInclude = {
  members: {
    where: { status: 'ACTIVE' as const },
    include: { user: { select: { id: true, name: true, email: true } } },
  },
  tasks: {
    where: { deleted: false },
    include: {
      assignments: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  proposedBy: { select: { id: true, name: true } },
};

export async function GET(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope');

  const where = {
    deleted: false,
    status: scope === 'proposals' ? 'DRAFT' as const : 'ACTIVE' as const,
  };

  const include = scope === 'pending-leaders'
    ? { ...projectInclude, members: { include: { user: { select: { id: true, name: true, email: true } } } } }
    : projectInclude;

  const projects = await prisma.project.findMany({
    where,
    include,
    orderBy: { createdAt: 'desc' },
  });

  const userMemberships = await prisma.projectMember.findMany({
    where: { userId: session.userId, status: 'ACTIVE' },
    select: { projectId: true, role: true },
  });

  const membershipMap = new Map(userMemberships.map((m) => [m.projectId, m.role]));

  const enriched = projects.map((p) => ({
    ...p,
    isMember: membershipMap.has(p.id),
    membershipRole: membershipMap.get(p.id) || null,
    taskCount: p.tasks.length,
    tasks: p.tasks,
  }));

  return NextResponse.json({ projects: enriched });
}

export async function POST(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, description, color } = await request.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const isAdmin = session.role === 'ADMIN';

  const project = await prisma.project.create({
    data: {
      name,
      description,
      color,
      status: isAdmin ? 'ACTIVE' : 'DRAFT',
      proposedById: isAdmin ? undefined : session.userId,
      members: {
        create: {
          userId: session.userId,
          role: isAdmin ? 'LEADER' : 'LEADER',
          status: isAdmin ? 'ACTIVE' : 'PENDING',
        },
      },
    },
    include: projectInclude,
  });

  return NextResponse.json({ project }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, name, description, color, status } = await request.json();
  if (!id) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });

  const project = await prisma.project.findUnique({ where: { id } });

  if (!project || project.deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.userId, projectId: id } },
  });

  const isAdmin = session.role === 'ADMIN';
  const isLeader = membership?.role === 'LEADER' && membership.status === 'ACTIVE';

  if (!isAdmin && !isLeader) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated = await prisma.project.update({
    where: { id },
    data: { name, description, color, status },
    include: projectInclude,
  });

  return NextResponse.json({ project: updated });
}

export async function DELETE(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });

  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Only ADMIN can delete projects' }, { status: 403 });

  await prisma.project.update({ where: { id }, data: { deleted: true } });
  return NextResponse.json({ message: 'Project deleted' });
}
