export function useAuth() {
    const raw = localStorage.getItem('userSession')
    const user = raw ? JSON.parse(raw) : null

    return {
        user,
        isOwner: user?.role === 'owner',
        isManager: user?.role === 'manager',
        isLoggedIn: !!user,
    }
}


