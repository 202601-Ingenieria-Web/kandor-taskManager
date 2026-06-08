'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { toast } from 'sonner'

type User = { id: string; name: string; email: string }
type Assignment = { id: string; user: User }
type Project = { id: string; name: string; color: string | null }
type Task = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  estimatedHours: number | null
  createdAt: string
  project: Project | null
  assignments: Assignment[]
}

const statuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export function TasksClient({ role }: { role: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('TODO')
  const [priority, setPriority] = useState('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [projectId, setProjectId] = useState('')
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])

  const canManage = role === 'ADMIN' || role === 'TEAM_LEADER'

  const fetchTasks = () => {
    fetch('/api/tasks')
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks || []))
      .catch(() => {})
  }

  useEffect(() => {
    fetchTasks()
    fetch('/api/users').then((r) => r.json()).then((d) => setUsers(d.users || [])).catch(() => {})
    fetch('/api/projects').then((r) => r.json()).then((d) => setProjects(d.projects || [])).catch(() => {})
  }, [])

  function resetForm() {
    setTitle(''); setDescription(''); setStatus('TODO'); setPriority('MEDIUM')
    setDueDate(''); setEstimatedHours(''); setProjectId('__none__'); setAssigneeIds([])
  }

  function openEdit(task: Task) {
    setEditing(task)
    setTitle(task.title)
    setDescription(task.description || '')
    setStatus(task.status)
    setPriority(task.priority)
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '')
    setEstimatedHours(task.estimatedHours?.toString() || '')
    setProjectId(task.project?.id || '__none__')
    setAssigneeIds(task.assignments.map((a) => a.user.id))
    setOpen(true)
  }

  async function handleSave() {
    if (!title) return
    setLoading(true)
    try {
      const body = { title, description, status, priority, dueDate, estimatedHours, projectId: projectId === '__none__' ? null : projectId, assigneeIds }
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch('/api/tasks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { id: editing.id, ...body } : body),
      })
      if (!res.ok) throw new Error()
      toast.success(editing ? 'Tarea actualizada' : 'Tarea creada')
      setOpen(false)
      resetForm()
      setEditing(null)
      fetchTasks()
    } catch {
      toast.error('Error al guardar tarea')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta tarea?')) return
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Tarea eliminada')
      fetchTasks()
    } catch {
      toast.error('Error al eliminar tarea')
    }
  }

  async function handleFieldChange(id: string, data: Record<string, unknown>) {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      if (!res.ok) throw new Error()
      fetchTasks()
    } catch {
      toast.error('Error al actualizar')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tareas</h1>
        <Button onClick={() => { resetForm(); setEditing(null); setOpen(true) }}>Crear Tarea</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Asignados</TableHead>
              <TableHead>Vence</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.title}</TableCell>
                <TableCell>
                  {canManage ? (
                    <Select value={t.project?.id || '__none__'} onValueChange={(v) => handleFieldChange(t.id, { projectId: v === '__none__' ? null : v })}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Sin proyecto</SelectItem>
                        {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : t.project ? (
                    <span className="inline-flex items-center gap-1.5">
                      {t.project.color && (
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: t.project.color }} />
                      )}
                      {t.project.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Sin proyecto</span>
                  )}
                </TableCell>
                <TableCell>
                  <Select value={t.status} onValueChange={(v) => handleFieldChange(t.id, { status: v })}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{t.priority}</TableCell>
                <TableCell>{t.assignments.map((a) => a.user.name).join(', ') || '—'}</TableCell>
                <TableCell>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(t.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No hay tareas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v) { setEditing(null); resetForm() }; setOpen(v) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Tarea' : 'Crear Tarea'}</DialogTitle>
            <DialogDescription>Completa los campos para {editing ? 'actualizar la' : 'crear una nueva'} tarea</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel htmlFor="title">Título</FieldLabel>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la tarea" />
            </Field>
            <Field>
              <FieldLabel htmlFor="desc">Descripción</FieldLabel>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción opcional" />
            </Field>
            {canManage ? (
              <Field>
                <FieldLabel htmlFor="project">Proyecto</FieldLabel>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger><SelectValue placeholder="Sin proyecto" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin proyecto</SelectItem>
                    {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            ) : projectId ? (
              <Field>
                <FieldLabel>Proyecto</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {projects.find((p) => p.id === projectId)?.name || 'Sin proyecto'}
                </p>
              </Field>
            ) : null}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="status">Estado</FieldLabel>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="priority">Prioridad</FieldLabel>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="dueDate">Fecha de vencimiento</FieldLabel>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="hours">Esfuerzo estimado</FieldLabel>
                <Input id="hours" type="number" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} placeholder="0" />
              </Field>
            </div>
            {canManage ? (
              <Field>
                <FieldLabel>Asignados</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {users.map((u) => (
                    <label key={u.id} className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={assigneeIds.includes(u.id)}
                        onChange={(e) => setAssigneeIds(e.target.checked ? [...assigneeIds, u.id] : assigneeIds.filter((id) => id !== u.id))}
                      />
                      {u.name}
                    </label>
                  ))}
                </div>
              </Field>
            ) : assigneeIds.length > 0 ? (
              <Field>
                <FieldLabel>Asignados</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {users.filter((u) => assigneeIds.includes(u.id)).map((u) => u.name).join(', ')}
                </p>
              </Field>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); resetForm() }}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
