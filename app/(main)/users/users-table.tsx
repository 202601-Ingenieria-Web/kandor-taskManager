'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
  enabled: boolean
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  TEAM_LEADER: 'bg-[#0f172a] text-white',
  MEMBER: 'bg-gray-100 text-gray-700',
}

export function UsersTable({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [editing, setEditing] = useState<User | null>(null)
  const [newRole, setNewRole] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUpdateRole() {
    if (!editing || !newRole) return
    setLoading(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { id: editing.id, role: newRole } }),
      })
      if (!res.ok) throw new Error()
      toast.success('Rol actualizado correctamente')
      setUsers((prev) => prev.map((u) => (u.id === editing.id ? { ...u, role: newRole } : u)))
      setEditing(null)
    } catch {
      toast.error('Error al actualizar el rol')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100">
              <TableHead className="text-gray-500 font-medium">ID</TableHead>
              <TableHead className="text-gray-500 font-medium">Nombre</TableHead>
              <TableHead className="text-gray-500 font-medium">Email</TableHead>
              <TableHead className="text-gray-500 font-medium">Rol</TableHead>
              <TableHead className="text-gray-500 font-medium">Creado</TableHead>
              <TableHead className="text-gray-500 font-medium">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <TableCell className="font-mono text-xs text-gray-400">{user.id.slice(0, 8)}...</TableCell>
                <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                <TableCell className="text-gray-600">{user.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className="text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => { setEditing(user); setNewRole(user.role) }}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Editar Usuario</DialogTitle>
            <DialogDescription className="text-gray-500">Actualiza el rol del usuario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <span className="text-sm text-gray-500">Email:</span>
              <p className="font-medium text-gray-900">{editing?.email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Nuevo Rol</span>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="mt-1 border-gray-200">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="TEAM_LEADER">TEAM LEADER</SelectItem>
                  <SelectItem value="MEMBER">MEMBER</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button className="bg-[#0f172a] hover:bg-slate-800 text-white" onClick={handleUpdateRole} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
