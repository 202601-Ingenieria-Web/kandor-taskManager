'use client'

import { useState, useEffect, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type User = { id: string; name: string; email: string; role: string }
type LogEntry = {
  id: string
  action: string
  entity: string
  detail: string | null
  createdAt: string
  user: { id: string; name: string }
}

const actionLabels: Record<string, string> = {
  CREATED: 'Creó', UPDATED: 'Actualizó', DELETED: 'Eliminó',
  MOVED: 'Movió', ASSIGNED: 'Asignó', UNASSIGNED: 'Desasignó',
  JOINED: 'Se unió', LEFT: 'Salió', REQUESTED: 'Solicitó',
  APPROVED: 'Aprobó', REJECTED: 'Rechazó', CHECKED: 'Marcó',
  ADDED: 'Agregó', REMOVED: 'Removió',
}

export function HistoryClient({ role, userId }: { role: string; userId: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedUserId, setSelectedUserId] = useState(userId)
  const [loading, setLoading] = useState(true)

  const isAdmin = role === 'ADMIN'
  const isTeamLeader = role === 'TEAM_LEADER'

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/users')
        .then((r) => r.json())
        .then((d) => {
          const us = d.users || []
          setUsers(us)
          if (us.length > 0 && !us.find((u: User) => u.id === selectedUserId)) setSelectedUserId(us[0].id)
        })
        .catch(() => {})
    } else if (isTeamLeader) {
      Promise.all([
        fetch('/api/users').then((r) => r.json()),
        fetch('/api/projects').then((r) => r.json()),
      ]).then(([userRes, projRes]) => {
        const allUsers: User[] = userRes.users || []
        const projects = projRes.projects || []
        const memberIds = new Set<string>()
        memberIds.add(userId)
        projects.forEach((p: any) => {
          if (p.membershipRole === 'LEADER' || p.members?.some((m: any) => m.user?.id === userId && m.role === 'LEADER')) {
            p.members?.forEach((m: any) => { if (m.user?.id) memberIds.add(m.user.id) })
          }
        })
        const us = allUsers.filter((u) => memberIds.has(u.id))
        setUsers(us)
        if (us.length > 0 && !us.find((u: User) => u.id === selectedUserId)) setSelectedUserId(us[0].id)
      }).catch(() => {})
    } else {
      setUsers([])
    }
  }, [isAdmin, isTeamLeader, userId, selectedUserId])

  const fetchLogs = useCallback(() => {
    setLoading(true)
    const params = selectedUserId ? `?userId=${selectedUserId}` : ''
    fetch(`/api/audit-logs${params}`)
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedUserId])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const chartData = logs.reduce<Record<string, number>>((acc, log) => {
    const day = log.createdAt.split('T')[0]
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {})
  const chartSeries = Object.entries(chartData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: date.slice(5), count }))

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Historial de Actividad</h1>

      {(isAdmin || isTeamLeader) && users.length > 0 && (
        <div className="max-w-xs">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
            <SelectContent>
              {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {chartSeries.length > 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Actividad por día</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartSeries}>
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner className="size-6" /></div>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">Sin movimientos registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">ID</th>
                    <th className="pb-2 pr-4 font-medium">Fecha</th>
                    <th className="pb-2 pr-4 font-medium">Acción</th>
                    <th className="pb-2 pr-4 font-medium">Detalle</th>
                    <th className="pb-2 font-medium">Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-muted-foreground text-xs font-mono">{log.id.slice(0, 8)}</td>
                      <td className="py-2 pr-4">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-4">
                        <span className="font-medium">{actionLabels[log.action] || log.action}</span>
                        <span className="text-muted-foreground"> {log.entity.toLowerCase()}</span>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground max-w-[200px] truncate">{log.detail || '—'}</td>
                      <td className="py-2">{log.user.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
