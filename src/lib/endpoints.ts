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
        getByUsername: (username: string) => `/users/username/${username}`,
        vote: (id: string) => `/users/${id}/vote`,
        checkVote: (id: string) => `/users/${id}/vote`,
    },
    teams: {
        list: '/teams',
        get: (id: string) => `/teams/${id}`,
        create: '/teams',
        update: (id: string) => `/teams/${id}`,
        delete: (id: string) => `/teams/${id}`,
        myTeam: '/teams/my-team',
        members: (id: string) => `/teams/${id}/members`,
        uploadImage: (id: string) => `/teams/${id}/images`,
        invitations: '/teams/invitations',
        invitation: (id: string) => `/teams/invitations/${id}`,
        joinRequests: '/teams/join-requests',
        joinRequest: (id: string) => `/teams/join-requests/${id}`,
    }
}

export default endpoints;