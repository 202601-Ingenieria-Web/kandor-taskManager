import { verifySession } from '@/lib/dal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SettingsPage() {
  await verifySession()
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <Card>
        <CardHeader><CardTitle>Configuración del Sistema</CardTitle></CardHeader>
        <CardContent>Aquí podrás configurar las preferencias del sistema.</CardContent>
      </Card>
    </div>
  )
}
