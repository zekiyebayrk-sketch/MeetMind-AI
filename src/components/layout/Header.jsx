import Avatar from '../common/Avatar'

function Header({ title, subtitle }) {
  return (
    <header className="flex items-start justify-between gap-4 sm:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-500 md:text-base">{subtitle}</p>}
      </div>
      <Avatar initials="Z" tone="bg-blue-100 text-blue-700" />
    </header>
  )
}

export default Header
