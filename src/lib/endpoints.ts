const endpoints = {
    auth: {
        signIn: '/auth/signin',
        signUp: '/auth/signup',
        signOut: '/auth/signout',
        getSession: '/auth/session',
    },
    profile: {
        update: '/profile',
        uploadAvatar: '/profile/avatar',
    },
    users: {
        list: '/users',
        updateStatus: (id: string) => `/users/${id}/status`,
        updateScore: (id: string) => `/users/${id}/score`,
        updateRole: (id: string) => `/users/${id}/role`,
        delete: (id: string) => `/users/${id}`,
    }
}

export default endpoints;