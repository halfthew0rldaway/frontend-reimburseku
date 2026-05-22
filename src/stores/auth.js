import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token') || null)

    function setUser(userData) {
        user.value = userData
    }

    function setToken(newToken) {
        token.value = newToken
        localStorage.setItem('token', newToken)
    }

    return { user, token, setUser, setToken }
})