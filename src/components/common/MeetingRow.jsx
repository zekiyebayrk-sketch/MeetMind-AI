import { Link } from 'react-router-dom'
import AvatarGroup from './AvatarGroup'
import StatusPill from './StatusPill'
import { ChevronRightIcon } from './icons'
import { categoryStyles } from '../../constants/meetings'
import { formatDate, formatDuration } from '../../utils/format'

function MeetingRow({ meeting }) {
  const { id, title, category, date, durationMinutes, actionItems, participants, attendees, status } =
    meeting

  return (
    <Link
      to={`/analysis-result/${id}`}
      className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-4 sm:items-center">
        <span
          className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold sm:flex ${
            categoryStyles[category] ?? 'bg-slate-100 text-slate-600'
          }`}
        >
          {category.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <StatusPill tone="success">{status}</StatusPill>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-slate-500">
            <span>{formatDate(date)}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{formatDuration(durationMinutes)}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{actionItems} action items</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <AvatarGroup initials={attendees} total={participants} size={26} />
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" />
      </div>
    </Link>
  )
}

export default MeetingRow
