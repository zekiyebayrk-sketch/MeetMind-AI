import { useMemo, useState } from 'react'
import Header from '../components/layout/Header'
import MeetingRow from '../components/common/MeetingRow'
import { SearchIcon } from '../components/common/icons'
import { getRecencyGroup } from '../utils/format'
import { getAllMeetings } from '../utils/meetingsStore'

const groupOrder = ['This Week', 'Last Week', 'Earlier']

function History() {
  const [query, setQuery] = useState('')
  const meetings = useMemo(() => getAllMeetings(), [])

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return meetings
    return meetings.filter(
      (meeting) =>
        meeting.title.toLowerCase().includes(trimmed) ||
        meeting.category.toLowerCase().includes(trimmed),
    )
  }, [query])

  const groups = useMemo(() => {
    const map = new Map()
    for (const meeting of filtered) {
      const group = getRecencyGroup(meeting.date)
      if (!map.has(group)) map.set(group, [])
      map.get(group).push(meeting)
    }
    return groupOrder
      .map((label) => ({ label, items: map.get(label) ?? [] }))
      .filter((group) => group.items.length > 0)
  }, [filtered])

  return (
    <div className="flex flex-col gap-8">
      <Header
        title="Meeting History"
        subtitle="Browse and revisit every meeting MeetMind AI has analyzed."
      />

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search meetings by title or category"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:max-w-sm"
        />
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <SearchIcon className="h-6 w-6 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No meetings match &ldquo;{query}&rdquo;</p>
          <p className="text-sm text-slate-400">Try a different title or category.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(({ label, items }) => (
            <section key={label}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
              </h2>
              <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
                {items.map((meeting) => (
                  <MeetingRow key={meeting.id} meeting={meeting} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export default History
