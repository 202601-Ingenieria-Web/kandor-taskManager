'use client'

import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import Image from 'next/image'
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
  Settings05Icon,
} from '@hugeicons/core-free-icons'

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} /> },
  { title: 'Proyectos', url: '/projects', icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} /> },
  { title: 'Tareas', url: '/tasks', icon: <HugeiconsIcon icon={TaskEdit01Icon} strokeWidth={2} /> },
  { title: 'Usuarios', url: '/users', icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} /> },
  { title: 'Configuración', url: '/settings', icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='data-[slot=sidebar-menu-button]:p-1.5!'>
              <a href='#'>
                <Image src='/LogoGreen.png' alt='Logo' width={72} height={72} />
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
