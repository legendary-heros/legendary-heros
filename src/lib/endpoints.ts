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
    }
}

export default endpoints;