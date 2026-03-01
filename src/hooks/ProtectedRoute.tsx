import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ 
  children,
  requiredRole 
}: { 
  readonly children: React.ReactNode
  readonly requiredRole?: 'owner' | 'manager'
}) {
  const token = localStorage.getItem('token')
  const raw = localStorage.getItem('userSession')
  const { user } = useAuth()

  if (!token || !raw) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/homemain" replace />
  }

  return <>{children}</>
}