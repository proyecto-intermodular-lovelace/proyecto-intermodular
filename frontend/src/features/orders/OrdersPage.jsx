import { useAuth } from '../../contexts/AuthProvider'
import StudentOrdersView from './StudentOrdersView'
import TeacherOrdersView from './TeacherOrdersView'
import EconomatoView from './EconomatoView'

export default function OrdersPage() {
  const { user } = useAuth()

  if (user?.role === 'SUPERADMIN') return <EconomatoView />
  if (user?.role === 'ADMIN') return <TeacherOrdersView />
  return <StudentOrdersView />
}
