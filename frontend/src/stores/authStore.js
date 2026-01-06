import { defineStore } from 'pinia'
import { auth } from '@/services/firebase'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null
    }),

    getters: {
        isLoggedIn: (state) => !!state.user,
        uid: (state) => state.user?.uid || null
    },

    actions: {
        setUser(userInfo) {
            this.user = userInfo
        },

        clearUser() {
            this.user = null
        },

        async getIdToken() {
            const currentUser = auth.currentUser

            if (!currentUser) {
                console.error('No user is signed in')
                this.clearUser() // clear user if not logged in
            }

            try {
                const token = await currentUser.getIdToken()
                return `Bearer ${token}`
            } catch (error) {
                console.error('Failed to get ID token:', error)
            }
        }
    }
})
