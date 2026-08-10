import { NavLink } from 'react-router-dom'
import { GridIcon, PlusCircleIcon, ClockIcon, SettingsIcon } from '../common/icons'

const navItems = [
  { label: 'Dashboard', to: '/', icon: GridIcon, end: true },
  { label: 'New Meeting', to: '/new-meeting', icon: PlusCircleIcon },
  { label: 'History', to: '/history', icon: ClockIcon },
  { label: 'Settings', to: '/settings', icon: SettingsIcon },
]

function navLinkClasses({ isActive }) {
  return `group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'border-blue-600 bg-blue-50 text-blue-700'
      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`
}

function mobileNavLinkClasses({ isActive }) {
  return `flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors ${
    isActive ? 'text-blue-700' : 'text-slate-500'
  }`
}

function Sidebar() {
  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <div className="flex items-center gap-2.5 px-2 pb-8">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            M
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            MeetMind <span className="text-blue-600">AI</span>
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ label, to, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClasses}>
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur md:hidden">
        {navItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={mobileNavLinkClasses}>
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export default Sidebar
