'use client'

import { useEffect, useState, useRef } from 'react'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import { CondorIcon } from '@/components/condor-icon'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DashboardSquare01Icon,
  TaskEdit01Icon,
  Folder01Icon,
  UserGroupIcon,
  TimeHalfPassIcon,
} from '@hugeicons/core-free-icons'

interface Counts {
  leaveRequests?: number
  proposals?: number
  leaderRequests?: number
}

export function AppSidebar({ role, ...props }: { role?: string } & React.ComponentProps<typeof Sidebar>) {
  const [badge, setBadge] = useState<number | undefined>(undefined)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchCounts = () => {
    fetch('/api/notifications/counts')
      .then((r) => r.json())
      .then((data: Counts) => {
        let total = 0
        if (role === 'TEAM_LEADER') {
          total = data.leaveRequests ?? 0
        } else if (role === 'ADMIN') {
          total = (data.proposals ?? 0) + (data.leaveRequests ?? 0)
        }
        setBadge(total > 0 ? total : undefined)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchCounts()
    intervalRef.current = setInterval(fetchCounts, 15000)
    const onVisible = () => { if (document.visibilityState === 'visible') fetchCounts() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [role])

  const navItems = [
    { title: 'Dashboard', url: '/dashboard', icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} /> },
    { title: 'Proyectos', url: '/projects', icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />, badge },
    { title: 'Tareas', url: '/tasks', icon: <HugeiconsIcon icon={TaskEdit01Icon} strokeWidth={2} /> },
    ...(role === 'ADMIN' ? [{ title: 'Usuarios', url: '/users', icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} /> }] : []),
    { title: 'Historial', url: '/account/history', icon: <HugeiconsIcon icon={TimeHalfPassIcon} strokeWidth={2} /> },
  ]

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='data-[slot=sidebar-menu-button]:p-1.5!'>
              <a href='/dashboard' className='flex items-center gap-2'>
                <CondorIcon className='w-10 h-10' />
                <span className='text-lg font-semibold text-gray-900'>Kandor</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSecondary items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
