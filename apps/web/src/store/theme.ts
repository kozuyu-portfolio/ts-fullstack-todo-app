import { atom } from 'jotai'

const COLOR_SCHEME_KEY = 'color-scheme'

const saved = localStorage.getItem(COLOR_SCHEME_KEY) as 'light' | 'dark' | null
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

export const themeModeAtom = atom<'light' | 'dark'>(saved ?? (prefersDark ? 'dark' : 'light'))

export const toggleThemeAtom = atom(null, (get, set) => {
    const next = get(themeModeAtom) === 'light' ? 'dark' : 'light'
    set(themeModeAtom, next)
    localStorage.setItem(COLOR_SCHEME_KEY, next)
})
