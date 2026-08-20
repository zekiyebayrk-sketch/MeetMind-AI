import { createContext, useEffect, useMemo, useState } from 'react'

const THEME_STORAGE_KEY = 'meetmind:theme'
const VALID_THEMES = new Set(['light', 'dark', 'system'])

export const ThemeContext = createContext(null)

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return VALID_THEMES.has(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

function getSystemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme)
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark)

  const resolvedTheme = theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  useEffect(() => {
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event) => setSystemPrefersDark(event.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [theme])

  function setTheme(nextTheme) {
    if (!VALID_THEMES.has(nextTheme)) return
    setThemeState(nextTheme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // Ignore write failures (e.g. private browsing) — theme still applies for this session.
    }
  }

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
