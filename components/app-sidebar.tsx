'use client'

import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
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
                <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                  <svg className='w-5 h-5 text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M9 12l2 2 4-4' strokeLinecap='round' strokeLinejoin='round'/>
                    <rect x='3' y='3' width='18' height='18' rx='2' />
                  </svg>
                </div>
                <span className='text-lg font-semibold text-gray-900'>TaskFlow</span>
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
