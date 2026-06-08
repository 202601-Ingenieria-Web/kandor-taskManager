import { verifySession } from '@/lib/dal'
import { HistoryClient } from './history-client'

export default async function HistoryPage() {
  const session = await verifySession()
  return <HistoryClient role={session.role} userId={session.userId} />
}
