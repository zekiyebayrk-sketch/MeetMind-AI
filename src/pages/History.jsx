import { useMemo, useState } from 'react'
import Header from '../components/layout/Header'
import MeetingRow from '../components/common/MeetingRow'
import Card from '../components/common/Card'
import EmptyState from '../components/common/EmptyState'
import { SearchIcon } from '../components/common/icons'
import { inputSurfaceClasses } from '../components/common/inputStyles'
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

      <div className="relative sm:max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search meetings by title or category"
          className={inputSurfaceClasses({ shape: 'pill', hasIcon: true })}
        />
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={`No meetings match “${query}”`}
          description="Try a different title or category."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(({ label, items }) => (
            <section key={label}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                {label}
              </h2>
              <Card material="soft" className="mt-3 divide-y divide-border/40">
                {items.map((meeting) => (
                  <MeetingRow key={meeting.id} meeting={meeting} />
                ))}
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export default History
