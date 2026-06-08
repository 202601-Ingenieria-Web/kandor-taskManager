import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/sonner';
import { verifySession } from '@/lib/dal';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" role={session.role} />
        <SidebarInset>
          {children}
          <Toaster />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
