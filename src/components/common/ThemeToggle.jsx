import { useTheme } from '../../hooks/useTheme'
import { SunIcon, MoonIcon, MonitorIcon } from './icons'

const options = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-surface-secondary p-1">
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default ThemeToggle
