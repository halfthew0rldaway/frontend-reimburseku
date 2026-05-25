import apiClient from './apiClient'

export default {
    /**
     * Endpoint untuk Login
     * @param {Object} credentials - Berisi email dan password
     */
    login(credentials) {
        return apiClient.post('/login', credentials)
    },



    /**
     * Contoh endpoint untuk mendapatkan profil user
     */
    getProfile() {
        return apiClient.get('/user')
    },
    

    getCategories(){
        return apiClient.get('/category')
    }
}