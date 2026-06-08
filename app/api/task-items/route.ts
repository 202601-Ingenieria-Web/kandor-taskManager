import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });

  const items = await prisma.taskItem.findMany({
    where: { taskId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { taskId, name, direction } = await request.json();
  if (!taskId || !name) return NextResponse.json({ error: 'taskId and name required' }, { status: 400 });

  const item = await prisma.taskItem.create({
    data: { taskId, name, direction: direction || 'INPUT' },
  });
  return NextResponse.json({ item }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, name, checked } = await request.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (checked !== undefined) data.checked = checked;

  const item = await prisma.taskItem.update({ where: { id }, data });
  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.taskItem.delete({ where: { id } });
  return NextResponse.json({ message: 'Deleted' });
}
