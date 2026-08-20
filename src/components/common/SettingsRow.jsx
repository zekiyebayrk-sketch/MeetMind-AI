import { Link } from 'react-router-dom'
import { ChevronRightIcon } from './icons'

function SettingsRow({ icon: Icon, label, description, control, onClick, to, showChevron = false }) {
  const content = (
    <>
      <div className="flex items-center gap-3.5">
        {Icon && <Icon className="h-[18px] w-[18px] shrink-0 text-text-secondary" />}
        <div>
          <p className="text-sm font-medium text-text-primary">{label}</p>
          {description && <p className="mt-0.5 text-xs text-text-secondary">{description}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {control}
        {showChevron && <ChevronRightIcon className="h-4 w-4 text-text-tertiary" />}
      </div>
    </>
  )

  const baseClasses = 'flex items-center justify-between gap-4 px-6 py-4 md:px-7'
  const interactiveClasses = onClick || to ? ' transition-colors hover:bg-surface-secondary' : ''

  if (to) {
    return (
      <Link to={to} className={`${baseClasses}${interactiveClasses}`}>
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`w-full text-left ${baseClasses}${interactiveClasses}`}>
        {content}
      </button>
    )
  }

  return <div className={baseClasses}>{content}</div>
}

export default SettingsRow
