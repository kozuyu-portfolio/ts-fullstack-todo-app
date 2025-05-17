import { createClient } from '@hey-api/client-axios'

export const apiClient = createClient({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
    withCredentials: true,
    auth: () => Promise.resolve(localStorage.getItem('token') ?? ''),
})
