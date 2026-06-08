import { verifySession } from '@/lib/dal'
import { TasksClient } from './tasks-client'

export default async function TasksPage() {
  const session = await verifySession()
  return <TasksClient role={session.role} />
}
