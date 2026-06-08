import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Limpiando datos existentes...')
  await prisma.auditLog.deleteMany()
  await prisma.taskItem.deleteMany()
  await prisma.taskAssignment.deleteMany()
  await prisma.taskDependency.deleteMany()
  await prisma.taskResource.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.timeEntry.deleteMany()
  await prisma.task.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()

  const hash = await bcrypt.hash('123456', 10)

  // ---- USERS ----
  const admin  = await prisma.user.create({ data: { name: 'Admin Kándor', email: 'admin@kandor.com', password: hash, role: 'ADMIN' } })
  const tl1    = await prisma.user.create({ data: { name: 'Laura Líder', email: 'laura@kandor.com', password: hash, role: 'TEAM_LEADER' } })
  const tl2    = await prisma.user.create({ data: { name: 'Carlos Capitán', email: 'carlos@kandor.com', password: hash, role: 'TEAM_LEADER' } })
  const tl3    = await prisma.user.create({ data: { name: 'Marta Manager', email: 'marta@kandor.com', password: hash, role: 'TEAM_LEADER' } })
  const m1     = await prisma.user.create({ data: { name: 'Ana Ayudante', email: 'ana@kandor.com', password: hash, role: 'MEMBER' } })
  const m2     = await prisma.user.create({ data: { name: 'Luis López', email: 'luis@kandor.com', password: hash, role: 'MEMBER' } })
  const m3     = await prisma.user.create({ data: { name: 'Sara Sánchez', email: 'sara@kandor.com', password: hash, role: 'MEMBER' } })
  const m4     = await prisma.user.create({ data: { name: 'Pedro Pérez', email: 'pedro@kandor.com', password: hash, role: 'MEMBER' } })
  const m5     = await prisma.user.create({ data: { name: 'Elena Estrada', email: 'elena@kandor.com', password: hash, role: 'MEMBER' } })
  console.log('✓ 9 usuarios creados')

  // ---- PROJECTS ----
  const p1 = await prisma.project.create({
    data: { name: 'App Móvil Kándor', description: 'Desarrollo de la aplicación móvil del sistema Kándor para iOS y Android', color: '#14b8a6', status: 'ACTIVE' },
  })
  const p2 = await prisma.project.create({
    data: { name: 'Portal Web', description: 'Rediseño del portal web corporativo con integración Kándor', color: '#6366f1', status: 'ACTIVE' },
  })
  const p3 = await prisma.project.create({
    data: { name: 'API Gateway', description: 'Microservicio de API Gateway para unificar los servicios del backend', color: '#f59e0b', status: 'ACTIVE' },
  })
  console.log('✓ 3 proyectos creados')

  // ---- MEMBERSHIPS ----
  // Proyecto 1: Laura lidera, Ana, Luis, Sara miembros
  await prisma.projectMember.createMany({
    data: [
      { userId: tl1.id, projectId: p1.id, role: 'LEADER', status: 'ACTIVE' },
      { userId: m1.id,  projectId: p1.id, role: 'MEMBER', status: 'ACTIVE' },
      { userId: m2.id,  projectId: p1.id, role: 'MEMBER', status: 'ACTIVE' },
      { userId: m3.id,  projectId: p1.id, role: 'MEMBER', status: 'ACTIVE' },
    ],
  })
  // Proyecto 2: Carlos lidera, Sara, Pedro, Elena miembros
  await prisma.projectMember.createMany({
    data: [
      { userId: tl2.id, projectId: p2.id, role: 'LEADER', status: 'ACTIVE' },
      { userId: m3.id,  projectId: p2.id, role: 'MEMBER', status: 'ACTIVE' },
      { userId: m4.id,  projectId: p2.id, role: 'MEMBER', status: 'ACTIVE' },
      { userId: m5.id,  projectId: p2.id, role: 'MEMBER', status: 'ACTIVE' },
    ],
  })
  // Proyecto 3: Marta lidera, Ana, Luis, Pedro, Elena miembros
  await prisma.projectMember.createMany({
    data: [
      { userId: tl3.id, projectId: p3.id, role: 'LEADER', status: 'ACTIVE' },
      { userId: m1.id,  projectId: p3.id, role: 'MEMBER', status: 'ACTIVE' },
      { userId: m2.id,  projectId: p3.id, role: 'MEMBER', status: 'ACTIVE' },
      { userId: m4.id,  projectId: p3.id, role: 'MEMBER', status: 'ACTIVE' },
      { userId: m5.id,  projectId: p3.id, role: 'MEMBER', status: 'ACTIVE' },
    ],
  })
  console.log('✓ membresías creadas')

  // ---- TASKS ----
  // Helper to create a task with assignments and audit log
  async function createTask(opts: {
    title: string; status: string; priority: string; projectId: string
    assigneeIds: string[]; createdBy: string
    createdDaysAgo?: number; completedDaysAgo?: number
    description?: string; dueDateDays?: number
  }) {
    const now = new Date()
    const createdAt = new Date(now); createdAt.setDate(createdAt.getDate() - (opts.createdDaysAgo ?? 0))
    const dueDate = opts.dueDateDays != null ? (() => { const d = new Date(); d.setDate(d.getDate() + opts.dueDateDays!); return d })() : null

    const task = await prisma.task.create({
      data: {
        title: opts.title,
        description: opts.description ?? null,
        status: opts.status as any,
        priority: opts.priority as any,
        dueDate,
        createdAt,
        projectId: opts.projectId,
        assignments: { create: opts.assigneeIds.map((uid) => ({ userId: uid })) },
      },
    })

    // Audit log for creation
    await prisma.auditLog.create({
      data: {
        action: 'CREATED', entity: 'Tarea', entityId: task.id,
        detail: opts.title, userId: opts.createdBy, projectId: opts.projectId, createdAt,
      },
    })

    // If task was moved to a different status, record that
    const nonInitialStatuses = ['IN_PROGRESS', 'REVIEW', 'DONE']
    if (nonInitialStatuses.includes(opts.status)) {
      const movedAt = new Date(now)
      // If completed, simulate the move chain
      if (opts.status === 'DONE' && opts.completedDaysAgo != null) {
        const doneAt = new Date(now); doneAt.setDate(doneAt.getDate() - opts.completedDaysAgo)
        await prisma.auditLog.create({
          data: {
            action: 'MOVED', entity: 'Tarea', entityId: task.id,
            detail: `"${opts.title}": movida de TODO a ${opts.status}`,
            userId: opts.createdBy, projectId: opts.projectId, createdAt: doneAt,
          },
        })
      } else {
        movedAt.setDate(movedAt.getDate() - (opts.createdDaysAgo ?? 0) + 1)
        await prisma.auditLog.create({
          data: {
            action: 'MOVED', entity: 'Tarea', entityId: task.id,
            detail: `"${opts.title}": movida de TODO a ${opts.status}`,
            userId: opts.createdBy, projectId: opts.projectId, createdAt: movedAt,
          },
        })
      }
    }

    return task
  }

  // Project 1 - App Móvil (Laura + Ana, Luis, Sara)
  // Completed tasks (for burndown chart)
  await createTask({ title: 'Login biométrico', status: 'DONE', priority: 'HIGH', projectId: p1.id, assigneeIds: [m1.id], createdBy: tl1.id, createdDaysAgo: 14, completedDaysAgo: 10 })
  await createTask({ title: 'Onboarding de usuario', status: 'DONE', priority: 'MEDIUM', projectId: p1.id, assigneeIds: [m2.id], createdBy: tl1.id, createdDaysAgo: 14, completedDaysAgo: 9 })
  await createTask({ title: 'Pantalla de inicio', status: 'DONE', priority: 'HIGH', projectId: p1.id, assigneeIds: [m3.id], createdBy: tl1.id, createdDaysAgo: 12, completedDaysAgo: 7 })
  await createTask({ title: 'Navegación principal', status: 'DONE', priority: 'HIGH', projectId: p1.id, assigneeIds: [m1.id, m2.id], createdBy: tl1.id, createdDaysAgo: 12, completedDaysAgo: 5 })
  await createTask({ title: 'Integración notificaciones push', status: 'DONE', priority: 'MEDIUM', projectId: p1.id, assigneeIds: [m2.id], createdBy: tl1.id, createdDaysAgo: 10, completedDaysAgo: 3 })
  await createTask({ title: 'Modo offline', status: 'DONE', priority: 'LOW', projectId: p1.id, assigneeIds: [m3.id], createdBy: tl1.id, createdDaysAgo: 10, completedDaysAgo: 1 })
  // In progress
  await createTask({ title: 'Dashboard móvil', status: 'IN_PROGRESS', priority: 'HIGH', projectId: p1.id, assigneeIds: [m1.id], createdBy: tl1.id, createdDaysAgo: 5 })
  await createTask({ title: 'Sincronización en segundo plano', status: 'IN_PROGRESS', priority: 'HIGH', projectId: p1.id, assigneeIds: [m2.id], createdBy: tl1.id, createdDaysAgo: 4 })
  // Review
  await createTask({ title: 'Gestión de perfiles', status: 'REVIEW', priority: 'MEDIUM', projectId: p1.id, assigneeIds: [m3.id], createdBy: tl1.id, createdDaysAgo: 3 })
  // Todo / Backlog
  await createTask({ title: 'Chat en tiempo real', status: 'TODO', priority: 'MEDIUM', projectId: p1.id, assigneeIds: [m1.id], createdBy: tl1.id, createdDaysAgo: 2 })
  await createTask({ title: 'Exportar reportes PDF', status: 'TODO', priority: 'LOW', projectId: p1.id, assigneeIds: [m2.id, m3.id], createdBy: tl1.id, createdDaysAgo: 2 })
  await createTask({ title: 'Widget de accesos directos', status: 'BACKLOG', priority: 'LOW', projectId: p1.id, assigneeIds: [m1.id], createdBy: tl1.id, createdDaysAgo: 1 })
  await createTask({ title: 'Soporte para tablets', status: 'BACKLOG', priority: 'URGENT', projectId: p1.id, assigneeIds: [], createdBy: tl1.id, createdDaysAgo: 1 })

  // Project 2 - Portal Web (Carlos + Sara, Pedro, Elena)
  await createTask({ title: 'Maquetación home', status: 'DONE', priority: 'HIGH', projectId: p2.id, assigneeIds: [m3.id], createdBy: tl2.id, createdDaysAgo: 12, completedDaysAgo: 8 })
  await createTask({ title: 'Componente de login', status: 'DONE', priority: 'HIGH', projectId: p2.id, assigneeIds: [m4.id], createdBy: tl2.id, createdDaysAgo: 12, completedDaysAgo: 6 })
  await createTask({ title: 'Página de productos', status: 'DONE', priority: 'MEDIUM', projectId: p2.id, assigneeIds: [m5.id], createdBy: tl2.id, createdDaysAgo: 10, completedDaysAgo: 4 })
  await createTask({ title: 'Blog corporativo', status: 'DONE', priority: 'MEDIUM', projectId: p2.id, assigneeIds: [m3.id], createdBy: tl2.id, createdDaysAgo: 10, completedDaysAgo: 2 })
  await createTask({ title: 'Sistema de búsqueda', status: 'IN_PROGRESS', priority: 'HIGH', projectId: p2.id, assigneeIds: [m4.id, m5.id], createdBy: tl2.id, createdDaysAgo: 5 })
  await createTask({ title: 'Formulario de contacto', status: 'IN_PROGRESS', priority: 'MEDIUM', projectId: p2.id, assigneeIds: [m3.id], createdBy: tl2.id, createdDaysAgo: 4 })
  await createTask({ title: 'Integración Google Maps', status: 'REVIEW', priority: 'LOW', projectId: p2.id, assigneeIds: [m5.id], createdBy: tl2.id, createdDaysAgo: 3 })
  await createTask({ title: 'Galería multimedia', status: 'TODO', priority: 'MEDIUM', projectId: p2.id, assigneeIds: [m3.id, m4.id], createdBy: tl2.id, createdDaysAgo: 2 })
  await createTask({ title: 'SEO y meta tags', status: 'BACKLOG', priority: 'LOW', projectId: p2.id, assigneeIds: [], createdBy: tl2.id, createdDaysAgo: 1 })
  await createTask({ title: 'Modo oscuro', status: 'BACKLOG', priority: 'LOW', projectId: p2.id, assigneeIds: [m5.id], createdBy: tl2.id, createdDaysAgo: 1 })

  // Project 3 - API Gateway (Marta + Ana, Luis, Pedro, Elena)
  await createTask({ title: 'Configurar rutas base', status: 'DONE', priority: 'HIGH', projectId: p3.id, assigneeIds: [m1.id], createdBy: tl3.id, createdDaysAgo: 10, completedDaysAgo: 6 })
  await createTask({ title: 'Middleware de autenticación', status: 'DONE', priority: 'URGENT', projectId: p3.id, assigneeIds: [m2.id], createdBy: tl3.id, createdDaysAgo: 10, completedDaysAgo: 5 })
  await createTask({ title: 'Rate limiting', status: 'DONE', priority: 'HIGH', projectId: p3.id, assigneeIds: [m4.id], createdBy: tl3.id, createdDaysAgo: 8, completedDaysAgo: 3 })
  await createTask({ title: 'Balanceo de carga', status: 'IN_PROGRESS', priority: 'HIGH', projectId: p3.id, assigneeIds: [m1.id, m2.id], createdBy: tl3.id, createdDaysAgo: 5 })
  await createTask({ title: 'Logging centralizado', status: 'IN_PROGRESS', priority: 'MEDIUM', projectId: p3.id, assigneeIds: [m4.id], createdBy: tl3.id, createdDaysAgo: 4 })
  await createTask({ title: 'Circuito breaker', status: 'REVIEW', priority: 'HIGH', projectId: p3.id, assigneeIds: [m5.id], createdBy: tl3.id, createdDaysAgo: 3 })
  await createTask({ title: 'Documentación Swagger', status: 'REVIEW', priority: 'MEDIUM', projectId: p3.id, assigneeIds: [m1.id], createdBy: tl3.id, createdDaysAgo: 3 })
  await createTask({ title: 'Pruebas de integración', status: 'TODO', priority: 'HIGH', projectId: p3.id, assigneeIds: [m2.id, m4.id], createdBy: tl3.id, createdDaysAgo: 2 })
  await createTask({ title: 'Despliegue Docker', status: 'TODO', priority: 'MEDIUM', projectId: p3.id, assigneeIds: [m5.id], createdBy: tl3.id, createdDaysAgo: 2 })
  await createTask({ title: 'Monitorización Prometheus', status: 'BACKLOG', priority: 'MEDIUM', projectId: p3.id, assigneeIds: [], createdBy: tl3.id, createdDaysAgo: 1 })

  console.log('✓ ~33 tareas creadas con trazas de auditoría')
  console.log('')
  console.log('── Demo Lista ──────────────────────────────')
  console.log(' admin@kandor.com / 123456 → Admin Kándor')
  console.log(' laura@kandor.com  / 123456 → Laura Líder')
  console.log(' carlos@kandor.com / 123456 → Carlos Capitán')
  console.log(' marta@kandor.com  / 123456 → Marta Manager')
  console.log(' ana@kandor.com    / 123456 → Ana Ayudante (MEMBER)')
  console.log(' luis@kandor.com   / 123456 → Luis López')
  console.log(' sara@kandor.com   / 123456 → Sara Sánchez')
  console.log(' pedro@kandor.com  / 123456 → Pedro Pérez')
  console.log(' elena@kandor.com  / 123456 → Elena Estrada')
  console.log('────────────────────────────────────────────')
}

main().catch(console.error).finally(() => prisma.$disconnect())
