'use client'

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

const allNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} /> },
  { title: 'Proyectos', url: '/projects', icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} /> },
  { title: 'Tareas', url: '/tasks', icon: <HugeiconsIcon icon={TaskEdit01Icon} strokeWidth={2} /> },
  { title: 'Usuarios', url: '/users', icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />, adminOnly: true },
  { title: 'Historial', url: '/account/history', icon: <HugeiconsIcon icon={TimeHalfPassIcon} strokeWidth={2} /> },
]

export function AppSidebar({ role, ...props }: { role?: string } & React.ComponentProps<typeof Sidebar>) {
  const navItems = allNavItems.filter((item) => !item.adminOnly || role === 'ADMIN')
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
