import { verifySession } from '@/lib/dal'
import { ProjectsClient } from './projects-client'

export default async function ProjectsPage() {
  const session = await verifySession()
  return <ProjectsClient role={session.role} userId={session.userId} />
}
