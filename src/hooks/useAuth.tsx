export function useAuth() {
  const raw = localStorage.getItem('userSession')
  const user = raw ? JSON.parse(raw) : null

  return {
    user,

    // global role
    isUser: user?.global_role === 'user',

    // dorm role
    isOwner: user?.role === 'owner',
    isManager: user?.role === 'manager',
    isStaff: user?.role === 'staff',

    // ใช้ใน sidebar
    isOwnerOrManager:
      user?.role === 'owner' ||
      user?.role === 'manager',

    isLoggedIn: !!user
  }
}