import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const projects = await prisma.project.findMany({
    where: { deleted: false },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ projects });
}
