import { verifySession } from '@/lib/dal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ProjectsPage() {
  await verifySession()
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Proyectos</h1>
      <Card>
        <CardHeader><CardTitle>Gestión de Proyectos</CardTitle></CardHeader>
        <CardContent>Aquí podrás crear y gestionar proyectos.</CardContent>
      </Card>
    </div>
  )
}
