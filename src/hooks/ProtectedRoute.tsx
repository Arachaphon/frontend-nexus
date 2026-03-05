import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ 
  children,
  requiredRole 
}: { 
  readonly children: React.ReactNode
  readonly requiredRole?: 'owner' | 'manager' | 'landlord' | 'owner|landlord'
}) {
  const token = localStorage.getItem('token')
  const raw = localStorage.getItem('userSession')
  const { user } = useAuth()

  if (!token || !raw) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole) {
    if (requiredRole === 'owner|landlord') {
      const allowed = user?.role === 'owner' || user?.global_role === 'landlord'
      if (!allowed) return <Navigate to="/homemain" replace />
    } 
    else if (requiredRole === 'landlord') {
      if (user?.global_role !== 'landlord') return <Navigate to="/homemain" replace />
    }
    else {
      if (user?.role !== requiredRole) return <Navigate to="/homemain" replace />
    }
  }

  return <>{children}</>
}