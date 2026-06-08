'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

type User = { id: string; name: string; email: string }
type Member = { id: string; role: string; status: string; user: User }
type TaskAssignment = { id: string; user: { id: string; name: string } }
type Task = {
  id: string; title: string; description: string | null
  status: string; priority: string; dueDate: string | null
  estimatedHours: number | null
  assignments: TaskAssignment[]
}
type Project = {
  id: string; name: string; description: string | null; color: string | null
  status: string; createdAt: string
  isMember: boolean; membershipRole: string | null
  taskCount: number; tasks: Task[]
  members: Member[]
  proposedBy: { id: string; name: string } | null
}

const statuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']
const statusLabels: Record<string, string> = {
  BACKLOG: 'Backlog', TODO: 'Por Hacer', IN_PROGRESS: 'En Progreso',
  REVIEW: 'Revisión', DONE: 'Completado',
}

export function ProjectsClient({ role, userId }: { role: string; userId: string }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ taskId: string; fromStatus: string } | null>(null)
  const [confirmMove, setConfirmMove] = useState<{ taskId: string; toStatus: string; projectId: string } | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [createColor, setCreateColor] = useState('#3b82f6')
  const [creating, setCreating] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editColor, setEditColor] = useState('')

  const [memberOpen, setMemberOpen] = useState(false)
  const [memberProject, setMemberProject] = useState<Project | null>(null)
  const [memberLoading, setMemberLoading] = useState(false)

  const [proposals, setProposals] = useState<Project[]>([])
  const [proposalsOpen, setProposalsOpen] = useState(false)
  const [pendingLeaders, setPendingLeaders] = useState<(Member & { projectId: string; projectName: string })[]>([])
  const [pendingLeadersOpen, setPendingLeadersOpen] = useState(false)

  const isAdmin = role === 'ADMIN'
  const isTeamLeader = role === 'TEAM_LEADER'
  const canManage = isAdmin || isTeamLeader

  const fetchProjects = useCallback(() => {
    setLoading(true)
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(() => toast.error('Error al cargar proyectos'))
      .finally(() => setLoading(false))
  }, [])

  const fetchProposals = useCallback(() => {
    if (!isAdmin) return
    fetch('/api/projects?scope=proposals')
      .then((r) => r.json())
      .then((d) => setProposals(d.projects || []))
      .catch(() => {})
  }, [isAdmin])

  const fetchPendingLeaders = useCallback(() => {
    if (!isAdmin) return
    fetch('/api/projects?scope=pending-leaders')
      .then((r) => r.json())
      .then((d) => {
        const all = d.projects || []
        const pending: (Member & { projectId: string; projectName: string })[] = []
        all.forEach((p: Project) => {
          p.members?.forEach((m: Member) => {
            if (m.role === 'LEADER' && m.status === 'PENDING') pending.push({ ...m, projectId: p.id, projectName: p.name })
          })
        })
        setPendingLeaders(pending)
      })
      .catch(() => {})
  }, [isAdmin])

  useEffect(() => {
    fetchProjects()
    fetch('/api/users').then((r) => r.json()).then((d) => setAllUsers(d.users || [])).catch(() => {})
    if (isAdmin) { fetchProposals(); fetchPendingLeaders() }
  }, [fetchProjects, fetchProposals, fetchPendingLeaders, isAdmin])

  async function handleCreate() {
    if (!createName) return
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName, description: createDesc, color: createColor }),
      })
      if (!res.ok) throw new Error()
      toast.success(isAdmin ? 'Proyecto creado' : 'Propuesta enviada a revisión')
      setCreateOpen(false); setCreateName(''); setCreateDesc('')
      fetchProjects(); if (isAdmin) fetchProposals()
    } catch { toast.error('Error al crear proyecto') }
    finally { setCreating(false) }
  }

  async function handleEdit() {
    if (!editingProject || !editName) return
    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingProject.id, name: editName, description: editDesc, color: editColor }),
      })
      if (!res.ok) throw new Error()
      toast.success('Proyecto actualizado')
      setEditOpen(false); setEditingProject(null); fetchProjects()
    } catch { toast.error('Error al actualizar') }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este proyecto definitivamente?')) return
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Proyecto eliminado')
      fetchProjects()
    } catch { toast.error('Error al eliminar') }
  }

  async function handleJoin(projectId: string) {
    try {
      const res = await fetch('/api/projects/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Te has matriculado en el proyecto')
      fetchProjects()
    } catch { toast.error('Error al matricularse') }
  }

  async function handleLeave(projectId: string) {
    if (!confirm('¿Salir del proyecto?')) return
    try {
      const res = await fetch('/api/projects/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Has salido del proyecto')
      fetchProjects()
    } catch { toast.error('Error al salir') }
  }

  async function handleLeaderRequest(projectId: string) {
    try {
      const res = await fetch('/api/projects/leader-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Solicitud de liderazgo enviada al ADMIN')
      fetchProjects()
    } catch { toast.error('Error al solicitar') }
  }

  async function handleApproveLeader(memberUserId: string, projectId: string, approve: boolean) {
    try {
      const res = await fetch('/api/projects/leader-request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberUserId, projectId, approve }),
      })
      if (!res.ok) throw new Error()
      toast.success(approve ? 'Líder aprobado' : 'Solicitud rechazada')
      fetchPendingLeaders()
    } catch { toast.error('Error') }
  }

  async function handleAddMember(projectId: string, targetUserId: string) {
    try {
      const res = await fetch('/api/projects/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, userId: targetUserId, action: 'add' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Miembro agregado')
      fetchProjects()
    } catch { toast.error('Error al agregar miembro') }
  }

  async function handleRemoveMember(projectId: string, targetUserId: string) {
    if (!confirm('¿Eliminar este miembro del proyecto?')) return
    try {
      const res = await fetch('/api/projects/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, userId: targetUserId, action: 'remove' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Miembro eliminado')
      fetchProjects()
    } catch { toast.error('Error al eliminar miembro') }
  }

  async function handleApproveProposal(projectId: string, approve: boolean) {
    try {
      if (approve) {
        await fetch('/api/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: projectId, status: 'ACTIVE' }),
        })
      } else {
        await fetch(`/api/projects?id=${projectId}`, { method: 'DELETE' })
      }
      toast.success(approve ? 'Propuesta aceptada' : 'Propuesta rechazada')
      fetchProposals(); fetchProjects()
    } catch { toast.error('Error') }
  }

  function handleDragStart(taskId: string, fromStatus: string) {
    setDragging({ taskId, fromStatus })
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDrop(projectId: string, toStatus: string) {
    if (!dragging) return
    if (dragging.fromStatus === toStatus) { setDragging(null); return }
    setConfirmMove({ taskId: dragging.taskId, toStatus, projectId })
    setDragging(null)
  }

  async function handleConfirmMove() {
    if (!confirmMove) return
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmMove.taskId, status: confirmMove.toStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success('Tarea movida')
      setConfirmMove(null)
      fetchProjects()
    } catch { toast.error('Error al mover tarea') }
  }

  const sortedProjects = [...projects].sort((a, b) => {
    const aMember = a.isMember ? 0 : 1
    const bMember = b.isMember ? 0 : 1
    return aMember - bMember
  })

  if (loading) return <div className="p-6 flex justify-center"><Spinner className="size-8" /></div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Proyectos</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button variant="outline" onClick={() => { setProposalsOpen(true); fetchProposals() }}>
                Propuestas ({proposals.length})
              </Button>
              <Button variant="outline" onClick={() => { setPendingLeadersOpen(true); fetchPendingLeaders() }}>
                Solicitudes ({pendingLeaders.length})
              </Button>
            </>
          )}
          <Button onClick={() => setCreateOpen(true)}>
            {isAdmin ? 'Nuevo Proyecto' : 'Proponer Proyecto'}
          </Button>
        </div>
      </div>

      {sortedProjects.length === 0 ? (
        <p className="text-muted-foreground">No hay proyectos activos</p>
      ) : sortedProjects.map((project) => {
        const isMember = project.isMember
        const isLeader = project.membershipRole === 'LEADER'
        const canEdit = isAdmin || isLeader

        const tasksByStatus: Record<string, Task[]> = {}
        statuses.forEach((s) => { tasksByStatus[s] = project.tasks?.filter((t) => t.status === s) || [] })

        const isExpanded = expandedId === project.id

        return (
          <div key={project.id} className="border rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : project.id)}
            >
              <div className="flex items-center gap-3">
                {project.color && <span className="size-4 rounded-full" style={{ backgroundColor: project.color }} />}
                <div>
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {project.taskCount} tareas · {project.members?.length || 0} miembros
                    {isMember && ' · Matriculado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {!isMember && role === 'MEMBER' && (
                  <Button size="sm" onClick={() => handleJoin(project.id)}>Matricularse</Button>
                )}
                {!isMember && isTeamLeader && (
                  <Button size="sm" variant="secondary" onClick={() => handleLeaderRequest(project.id)}>
                    Solicitar Liderazgo
                  </Button>
                )}
                {isMember && (
                  <Button size="sm" variant="outline" onClick={() => handleLeave(project.id)}>Salir</Button>
                )}
                {canEdit && (
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingProject(project); setEditName(project.name)
                    setEditDesc(project.description || ''); setEditColor(project.color || '#3b82f6'); setEditOpen(true)
                  }}>Editar</Button>
                )}
                {canEdit && (
                  <Button size="sm" variant="outline" onClick={() => {
                    setMemberProject(project); setMemberOpen(true)
                  }}>Miembros</Button>
                )}
                {isAdmin && (
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(project.id)}>Eliminar</Button>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 min-h-[200px]">
                  {statuses.map((status) => (
                    <div
                      key={status}
                      className="bg-muted/30 rounded-lg p-3"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(project.id, status)}
                    >
                      <h3 className="text-sm font-medium mb-2 text-muted-foreground">{statusLabels[status]}</h3>
                      <div className="space-y-2 min-h-[60px]">
                        {tasksByStatus[status].map((task) => (
                          <div
                            key={task.id}
                            draggable={isMember}
                            onDragStart={() => isMember && handleDragStart(task.id, status)}
                            className={`bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow${isMember ? ' cursor-grab active:cursor-grabbing' : ''}`}
                          >
                            <p className="text-sm font-medium">{task.title}</p>
                            <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                              <p><span className="font-medium">Asignado a:</span> {task.assignments?.length > 0 ? task.assignments.map((a) => a.user.name).join(', ') : 'Aún no asignado'}</p>
                              <p><span className="font-medium">Prioridad:</span> {task.priority}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAdmin ? 'Nuevo Proyecto' : 'Proponer Proyecto'}</DialogTitle>
            <DialogDescription>Completa los datos del proyecto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field><FieldLabel>Nombre</FieldLabel><Input value={createName} onChange={(e) => setCreateName(e.target.value)} /></Field>
            <Field><FieldLabel>Descripción</FieldLabel><Textarea value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} /></Field>
            <Field><FieldLabel>Color</FieldLabel><Input type="color" value={createColor} onChange={(e) => setCreateColor(e.target.value)} /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={creating}>{creating ? 'Creando...' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Proyecto</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Field><FieldLabel>Nombre</FieldLabel><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></Field>
            <Field><FieldLabel>Descripción</FieldLabel><Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} /></Field>
            <Field><FieldLabel>Color</FieldLabel><Input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Miembros: {memberProject?.name}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-3">
            {memberProject?.members?.filter((m) => m.status === 'ACTIVE').map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <span className="text-sm">{m.user.name} <span className="text-muted-foreground">({m.role})</span></span>
                {m.user.id !== userId && (
                  <Button size="sm" variant="destructive" onClick={() => handleRemoveMember(memberProject.id, m.user.id)}>
                    Remover
                  </Button>
                )}
              </div>
            ))}
            <div className="border-t pt-3">
              <FieldLabel>Agregar miembro</FieldLabel>
              <div className="flex gap-2 mt-1">
                <Select onValueChange={(v) => handleAddMember(memberProject!.id, v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                  <SelectContent>
                    {allUsers.filter((u) => !memberProject?.members?.some((m) => m.user.id === u.id)).map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmMove} onOpenChange={() => setConfirmMove(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mover tarea</DialogTitle></DialogHeader>
          <DialogDescription>
            {confirmMove ? `¿Mover de "${statusLabels[dragging?.fromStatus || '']}" a "${statusLabels[confirmMove.toStatus]}"?` : ''}
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmMove(null)}>Cancelar</Button>
            <Button onClick={handleConfirmMove}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={proposalsOpen} onOpenChange={setProposalsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Propuestas de Proyecto</DialogTitle></DialogHeader>
          <div className="py-4 space-y-3">
            {proposals.length === 0 ? (
              <p className="text-muted-foreground">No hay propuestas pendientes</p>
            ) : proposals.map((p) => (
              <div key={p.id} className="border rounded-lg p-3">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.description || 'Sin descripción'}</p>
                <p className="text-xs text-muted-foreground mt-1">Propuesto por: {p.proposedBy?.name || '—'}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => handleApproveProposal(p.id, true)}>Aceptar</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleApproveProposal(p.id, false)}>Rechazar</Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingLeadersOpen} onOpenChange={setPendingLeadersOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Solicitudes de Liderazgo</DialogTitle></DialogHeader>
          <div className="py-4 space-y-3">
            {pendingLeaders.length === 0 ? (
              <p className="text-muted-foreground">No hay solicitudes pendientes</p>
            ) : pendingLeaders.map((m, i) => (
              <div key={i} className="border rounded-lg p-3">
                <p className="font-medium">{m.user.name}</p>
                <p className="text-sm text-muted-foreground">{m.projectName || 'Proyecto desconocido'}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => handleApproveLeader(m.user.id, m.projectId, true)}>Aprobar</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleApproveLeader(m.user.id, m.projectId, false)}>Rechazar</Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
