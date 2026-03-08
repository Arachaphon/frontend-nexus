import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type Role = 'user' | 'owner' | 'manager' | 'staff' | 'owner|manager'

export default function ProtectedRoute({
  children,
  requiredRole
}: {
  readonly children: React.ReactNode
  readonly requiredRole?: Role | Role[]  
}) {
  const token = localStorage.getItem('token')
  const raw   = localStorage.getItem('userSession')
  const { user } = useAuth()

  if (!token || !raw) return <Navigate to="/login" replace />
  if (!requiredRole)  return <>{children}</>

  if (Array.isArray(requiredRole)) {
    if (!user?.role || !requiredRole.includes(user.role as Role))
      return <Navigate to="/homemain" replace />
    return <>{children}</>
  }

  switch (requiredRole) {
    case 'user':
      if (user?.global_role !== 'user')
        return <Navigate to="/homemain" replace />
      break
    case 'owner|manager':
      if (user?.role !== 'owner' && user?.role !== 'manager')
        return <Navigate to="/homemain" replace />
      break
    case 'owner':
      if (user?.role !== 'owner')
        return <Navigate to="/homemain" replace />
      break
    case 'manager':
      if (user?.role !== 'manager')
        return <Navigate to="/homemain" replace />
      break
    case 'staff':
      if (user?.role !== 'staff')
        return <Navigate to="/homemain" replace />
      break
  }

  return <>{children}</>
}