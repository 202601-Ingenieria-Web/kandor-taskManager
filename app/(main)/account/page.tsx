import { verifySession, getUser } from '@/lib/dal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AccountPage() {
  const session = await verifySession()
  const user = await getUser()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mi Cuenta</h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Nombre</span>
            <p className="font-medium">{user?.name}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Email</span>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Rol</span>
            <p className="font-medium">{user?.role}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Miembro desde</span>
            <p className="font-medium">{user?.createdAt?.toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
