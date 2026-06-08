import prisma from '@/lib/prisma';

type LogInput = {
  action: string;
  entity: string;
  entityId?: string;
  detail?: string;
  userId: string;
  projectId?: string | null;
};

export async function recordAuditLog(input: LogInput) {
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) data[key] = value;
  }
  await prisma.auditLog.create({ data: data as any });
}
