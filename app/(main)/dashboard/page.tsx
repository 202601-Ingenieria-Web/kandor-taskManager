'use client'

import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, CartesianGrid } from 'recharts'

const statusLabels: Record<string, string> = {
  BACKLOG: 'Backlog', TODO: 'Por Hacer', IN_PROGRESS: 'En Progreso',
  REVIEW: 'Revisión', DONE: 'Completado',
}

const statusColors: Record<string, string> = {
  BACKLOG: 'bg-gray-100 text-gray-700',
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  REVIEW: 'bg-purple-100 text-purple-700',
  DONE: 'bg-green-100 text-green-700',
}

const statusIcons: Record<string, string> = {
  BACKLOG: '📋', TODO: '📝', IN_PROGRESS: '⚡', REVIEW: '🔍', DONE: '✅',
}

const chartColors: Record<string, string> = {
  BACKLOG: '#94a3b8', TODO: '#64748b', IN_PROGRESS: '#f59e0b',
  REVIEW: '#a855f7', DONE: '#22c55e',
}

const allStatuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6 flex justify-center"><Spinner className="size-8" /></div>
  if (!data) return <div className="p-6 text-red-500">Error al cargar dashboard</div>

  const { user, totalTasks, statusCounts, tasks, dailyMetrics, title } = data

  const countMap: Record<string, number> = {}
  statusCounts.forEach((s: any) => { countMap[s.status] = s._count })
  allStatuses.forEach((s) => { if (!countMap[s]) countMap[s] = 0 })

  const cfdData = [{ name: 'Estado Actual', ...countMap }]

  // Build chart data from dailyMetrics
  const burnupData = dailyMetrics.map((d: any) => ({
    date: d.date.slice(5),
    completadas: Number(d.burnup) || 0,
    total: Number(d.remaining || 0) + Number(d.burnup || 0),
  }))

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, <span className="text-teal-600">{user?.name}</span>
        </h1>
        <p className="text-gray-500 mt-1">{title}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tareas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-[#0f172a] rounded-xl flex items-center justify-center">
              <span className="text-xl">{totalTasks > 0 ? '📊' : '📭'}</span>
            </div>
          </div>
        </div>

        {allStatuses.map((st) => (
          <div key={st} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{statusLabels[st]}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{countMap[st]}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusColors[st]}`}>
                <span className="text-xl">{statusIcons[st]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
          <div className="space-y-2">
            {tasks.slice(0, 10).map((t: any) => (
              <div key={t.id} className="bg-white rounded-lg border border-gray-100 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`size-2 rounded-full ${statusColors[t.status]?.split(' ')[0] || 'bg-gray-300'}`} />
                  <span className="font-medium truncate">{t.title}</span>
                  {t.project && (
                    <span className="text-xs text-gray-400 truncate" style={t.project.color ? { color: t.project.color } : {}}>
                      {t.project.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>
                    {statusLabels[t.status] || t.status}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                    t.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {t.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Burnup</h3>
        <p className="text-sm text-gray-500 mb-4">Tareas completadas vs total</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={burnupData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" name="Total" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="completadas" name="Completadas" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">CFD</h3>
        <p className="text-sm text-gray-500 mb-4">Distribución actual de tareas por estado</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={cfdData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {allStatuses.map((s) => (
              <Bar key={s} dataKey={s} name={statusLabels[s]} fill={chartColors[s]} stackId="a" />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
