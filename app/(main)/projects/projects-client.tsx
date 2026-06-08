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
type TaskItem = { id: string; name: string; direction: string; checked: boolean; taskId: string }
type Task = {
  id: string; title: string; description: string | null
  status: string; priority: string; dueDate: string | null
  estimatedHours: number | null
  assignments: TaskAssignment[]
  items: TaskItem[]
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

  const [editTaskOpen, setEditTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDesc, setEditTaskDesc] = useState('')
  const [editTaskPriority, setEditTaskPriority] = useState('MEDIUM')
  const [editTaskStatus, setEditTaskStatus] = useState('BACKLOG')
  const [editTaskDue, setEditTaskDue] = useState('')
  const [editTaskHours, setEditTaskHours] = useState('')
  const [editTaskAssign, setEditTaskAssign] = useState('')
  const [savingTask, setSavingTask] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemDir, setNewItemDir] = useState<'INPUT' | 'OUTPUT'>('INPUT')

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
      .then((d) => {
        const ps = d.projects || []
        setProjects(ps)
        setMemberProject(prev => {
          if (prev) {
            const updated = ps.find((p: Project) => p.id === prev.id)
            return updated || prev
          }
          return prev
        })
        setEditingTask(prev => {
          if (prev) {
            for (const p of ps) {
              const found = p.tasks?.find((t: Task) => t.id === prev.id)
              if (found) return found
            }
          }
          return prev
        })
      })
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
    if (!confirm('¿Solicitar salir del proyecto?')) return
    try {
      const res = await fetch('/api/projects/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      toast.success(data.message)
      fetchProjects()
    } catch { toast.error('Error al solicitar salida') }
  }

  async function handleProcessLeave(projectId: string, targetUserId: string, approve: boolean) {
    try {
      const res = await fetch('/api/projects/leave', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, userId: targetUserId, approve }),
      })
      if (!res.ok) throw new Error()
      toast.success(approve ? 'Salida aprobada, tareas desasignadas' : 'Solicitud rechazada')
      fetchProjects()
    } catch { toast.error('Error al procesar solicitud') }
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

  function handleTaskClick(task: Task) {
    setEditingTask(task)
    setEditTaskTitle(task.title)
    setEditTaskDesc(task.description || '')
    setEditTaskPriority(task.priority)
    setEditTaskStatus(task.status)
    setEditTaskDue(task.dueDate ? task.dueDate.split('T')[0] : '')
    setEditTaskHours(task.estimatedHours?.toString() || '')
    setEditTaskAssign(task.assignments?.[0]?.user?.id || '')
    setEditTaskOpen(true)
  }

  async function handleEditTaskSave() {
    if (!editingTask || !editTaskTitle) return
    setSavingTask(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTask.id,
          title: editTaskTitle,
          description: editTaskDesc || null,
          priority: editTaskPriority,
          status: editTaskStatus,
          dueDate: editTaskDue || null,
          estimatedHours: editTaskHours ? Number(editTaskHours) : null,
          assigneeIds: editTaskAssign && editTaskAssign.trim() ? [editTaskAssign] : [],
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Tarea actualizada')
      setEditTaskOpen(false)
      setEditingTask(null)
      fetchProjects()
    } catch { toast.error('Error al guardar tarea') }
    finally { setSavingTask(false) }
  }

  async function handleAddItem() {
    if (!newItemName || !editingTask) return
    try {
      const res = await fetch('/api/task-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: editingTask.id, name: newItemName, direction: newItemDir }),
      })
      if (!res.ok) throw new Error()
      setNewItemName('')
      fetchProjects()
    } catch { toast.error('Error al agregar') }
  }

  async function handleToggleItem(item: TaskItem) {
    try {
      const res = await fetch('/api/task-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, checked: !item.checked }),
      })
      if (!res.ok) throw new Error()
      fetchProjects()
    } catch { toast.error('Error al actualizar') }
  }

  async function handleDeleteItem(id: string) {
    try {
      const res = await fetch(`/api/task-items?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      fetchProjects()
    } catch { toast.error('Error al eliminar') }
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
              className={`flex items-center justify-between p-4 ${isAdmin || isMember ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
              onClick={() => { if (isAdmin || isMember) setExpandedId(isExpanded ? null : project.id) }}
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
                {canEdit && (() => {
                  const leaveCount = project.members?.filter((m) => m.status === 'LEAVE_REQUESTED').length || 0
                  return (
                    <Button size="sm" variant="outline" onClick={() => {
                      setMemberProject(project); setMemberOpen(true)
                    }} className="relative">
                      Miembros
                      {leaveCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-yellow-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {leaveCount}
                        </span>
                      )}
                    </Button>
                  )
                })()}
                {isAdmin && (
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(project.id)}>Eliminar</Button>
                )}
              </div>
            </div>

            {(isAdmin || isMember) && isExpanded && (
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
                            onClick={() => handleTaskClick(task)}
                            className={`bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer${isMember ? ' cursor-grab active:cursor-grabbing' : ''}`}
                          >
                            <p className="text-sm font-medium">{task.title}</p>
                            {task.items && task.items.length > 0 && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {task.items.filter((i) => i.checked).length}/{task.items.length}
                              </p>
                            )}
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
            {memberProject?.members?.filter((m) => m.status === 'LEAVE_REQUESTED').map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-950/20 rounded p-2">
                <span className="text-sm">{m.user.name} <span className="text-muted-foreground">(solicita salir)</span></span>
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => handleProcessLeave(memberProject.id, m.user.id, true)}>Aceptar</Button>
                  <Button size="sm" variant="outline" onClick={() => handleProcessLeave(memberProject.id, m.user.id, false)}>Rechazar</Button>
                </div>
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

      <Dialog open={editTaskOpen} onOpenChange={(o) => { if (!o) { setEditTaskOpen(false); setEditingTask(null) } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar Tarea</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <Field><FieldLabel>Título</FieldLabel><Input value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} /></Field>
            <Field><FieldLabel>Descripción</FieldLabel><Textarea value={editTaskDesc} onChange={(e) => setEditTaskDesc(e.target.value)} /></Field>
            <Field>
              <FieldLabel>Prioridad</FieldLabel>
              <Select value={editTaskPriority} onValueChange={setEditTaskPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="CRITICAL">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Estado</FieldLabel>
              <Select value={editTaskStatus} onValueChange={setEditTaskStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field><FieldLabel>Fecha de vencimiento</FieldLabel><Input type="date" value={editTaskDue} onChange={(e) => setEditTaskDue(e.target.value)} /></Field>
            <Field><FieldLabel>Horas estimadas</FieldLabel><Input type="number" value={editTaskHours} onChange={(e) => setEditTaskHours(e.target.value)} min="0" /></Field>
            <Field>
              <FieldLabel>Asignado a</FieldLabel>
              <Select value={editTaskAssign} onValueChange={setEditTaskAssign}>
                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">Sin asignar</SelectItem>
                  {allUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            {/* insumos */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Insumos necesarios</h4>
              <div className="space-y-1 mb-3">
                {editingTask?.items?.filter((i) => i.direction === 'INPUT').map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <input type="checkbox" checked={item.checked} onChange={() => handleToggleItem(item)} className="size-4 accent-green-600" />
                    <span className={`text-sm flex-1 ${item.checked ? 'line-through text-muted-foreground' : ''}`}>{item.name}</span>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-xs text-destructive opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Nuevo insumo..." value={newItemDir === 'INPUT' ? newItemName : ''} onChange={(e) => { setNewItemDir('INPUT'); setNewItemName(e.target.value) }} className="h-8 text-sm" />
                <Button size="sm" onClick={() => { setNewItemDir('INPUT'); handleAddItem() }} disabled={!newItemName || newItemDir !== 'INPUT'}>Agregar</Button>
              </div>
            </div>

            {/* entregables */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Entregables obtenidos</h4>
              <div className="space-y-1 mb-3">
                {editingTask?.items?.filter((i) => i.direction === 'OUTPUT').map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <input type="checkbox" checked={item.checked} onChange={() => handleToggleItem(item)} className="size-4 accent-blue-600" />
                    <span className={`text-sm flex-1 ${item.checked ? 'line-through text-muted-foreground' : ''}`}>{item.name}</span>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-xs text-destructive opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Nuevo entregable..." value={newItemDir === 'OUTPUT' ? newItemName : ''} onChange={(e) => { setNewItemDir('OUTPUT'); setNewItemName(e.target.value) }} className="h-8 text-sm" />
                <Button size="sm" onClick={() => { setNewItemDir('OUTPUT'); handleAddItem() }} disabled={!newItemName || newItemDir !== 'OUTPUT'}>Agregar</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditTaskOpen(false); setEditingTask(null) }}>Cancelar</Button>
            <Button onClick={handleEditTaskSave} disabled={savingTask}>{savingTask ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
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
