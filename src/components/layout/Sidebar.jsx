import { NavLink, Link } from 'react-router-dom'
import Avatar from '../common/Avatar'
import { GridIcon, PlusCircleIcon, ClockIcon, SettingsIcon } from '../common/icons'

const navItems = [
  { label: 'Dashboard', to: '/', icon: GridIcon, end: true },
  { label: 'New Meeting', to: '/new-meeting', icon: PlusCircleIcon },
  { label: 'History', to: '/history', icon: ClockIcon },
  { label: 'Settings', to: '/settings', icon: SettingsIcon },
]

function navLinkClasses({ isActive }) {
  return `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-accent-subtle-bg text-accent' : 'text-text-primary hover:bg-surface/60'
  }`
}

function navIconClasses(isActive) {
  return `h-[18px] w-[18px] shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-text-primary'}`
}

function mobileNavLinkClasses({ isActive }) {
  return `flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors ${
    isActive ? 'text-accent' : 'text-text-primary'
  }`
}

function Sidebar() {
  return (
    <>
      <aside className="glass-panel sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col overflow-y-auto rounded-2xl border border-border/60 bg-sidebar-glass px-4 py-6 backdrop-blur-2xl backdrop-saturate-150 md:mx-4 md:mt-4 md:flex">
        <div className="flex items-center gap-2.5 px-2.5 pb-8">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            M
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">
            MeetMind <span className="text-accent">AI</span>
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {navItems.map(({ label, to, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <Icon filled={isActive} className={navIconClasses(isActive)} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-1 border-t border-border/40 pt-3">
          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-lg px-2.5 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface/60"
          >
            <Avatar initials="Z" tone="bg-avatar-blue-bg text-avatar-blue-text" size={32} />
            <span className="truncate">Zekiye Bayrak</span>
          </Link>
        </div>
      </aside>

      <nav className="glass-panel fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-border/60 bg-sidebar-glass px-2 py-2 backdrop-blur-2xl backdrop-saturate-150 md:hidden">
        {navItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={mobileNavLinkClasses}>
            {({ isActive }) => (
              <>
                <Icon filled={isActive} className="h-5 w-5 transition-colors" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export default Sidebar
