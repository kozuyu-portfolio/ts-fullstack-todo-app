import { createClient } from '@hey-api/client-axios'

export const apiClient = createClient({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
    withCredentials: true,
    auth: () => localStorage.getItem('token') ?? '',
})

apiClient.instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`)
    }
    return config
})

apiClient.instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    },
)
