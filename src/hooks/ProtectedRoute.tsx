
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('token')
    const raw = localStorage.getItem('userSession')

    if (!token || !raw) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}