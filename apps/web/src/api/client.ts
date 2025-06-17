import { createClient } from '@hey-api/client-axios'
import { authControllerRefresh } from '@ts-fullstack-todo/api-client'

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

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function refreshToken() {
    if (!refreshPromise) {
        isRefreshing = true
        refreshPromise = authControllerRefresh({ client: apiClient })
            .then((res) => {
                const newToken = res.data?.access_token
                if (newToken) {
                    localStorage.setItem('token', newToken)
                    return newToken
                }
                return null
            })
            .finally(() => {
                isRefreshing = false
                refreshPromise = null
            })
    }
    return refreshPromise
}

apiClient.instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            const newToken = await refreshToken()
            if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return apiClient.instance(originalRequest)
            }
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    },
)
