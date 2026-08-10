import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/common/Avatar'
import StatusPill from '../components/common/StatusPill'
import SectionCard from '../components/common/SectionCard'
import {
  SparklesIcon,
  UsersIcon,
  ChevronLeftIcon,
  CheckIcon,
  CheckCircleIcon,
  CalendarIcon,
  ListChecksIcon,
  DocumentTextIcon,
  TrendUpIcon,
} from '../components/common/icons'
import { meetings, categoryStyles } from '../constants/meetings'
import { analysisContent, defaultAnalysisId } from '../constants/analysisContent'
import { formatDate, formatDuration } from '../utils/format'
import { getMeetingById } from '../utils/meetingsStore'

const DEFAULT_MEETING = meetings.find((item) => item.id === defaultAnalysisId)

const sentimentTones = {
  Positive: 'bg-emerald-50 text-emerald-600',
  Neutral: 'bg-slate-100 text-slate-600',
  Mixed: 'bg-amber-50 text-amber-600',
}

function getOwnerInitials(owner) {
  if (!owner || owner === 'Unassigned') return '–'
  const parts = owner.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function AnalysisResult() {
  const navigate = useNavigate()
  const { meetingId } = useParams()

  const meeting = useMemo(
    () => (meetingId ? getMeetingById(meetingId) : null) ?? DEFAULT_MEETING,
    [meetingId],
  )
  const content =
    meeting.analysis ?? analysisContent[meeting.id] ?? analysisContent[defaultAnalysisId]

  const [checkedIds, setCheckedIds] = useState(() => new Set())

  function toggleItem(id) {
    setCheckedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const completedCount = checkedIds.size
  const totalCount = content.actionItems.length
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <StatusPill tone="brand" className="gap-1.5">
              <SparklesIcon className="h-3.5 w-3.5" />
              AI Meeting Analysis
            </StatusPill>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              {meeting.title}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-500">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  categoryStyles[meeting.category] ?? 'bg-slate-100 text-slate-600'
                }`}
              >
                {meeting.category}
              </span>
              <span>{formatDate(meeting.date)}</span>
              <span aria-hidden="true">&middot;</span>
              <span>{formatDuration(meeting.durationMinutes)}</span>
              <span aria-hidden="true">&middot;</span>
              <span className="inline-flex items-center gap-1">
                <UsersIcon className="h-4 w-4" />
                {meeting.participants} {meeting.participants === 1 ? 'participant' : 'participants'}
              </span>
            </div>
          </div>
          <Avatar initials="Z" tone="bg-blue-100 text-blue-700" className="shrink-0" />
        </div>
      </div>

      <section className="grid grid-cols-1 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex items-center gap-3 px-6 py-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Sentiment</p>
            <span
              className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                sentimentTones[content.overview.sentiment] ?? sentimentTones.Neutral
              }`}
            >
              {content.overview.sentiment}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <TrendUpIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Engagement Score
            </p>
            <p className="text-lg font-semibold tracking-tight text-slate-900">
              {content.overview.engagementScore}
              <span className="text-sm font-medium text-slate-400">/10</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UsersIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Talk Time</p>
            <p className="text-sm font-semibold text-slate-900">{content.overview.talkTimeBalance}</p>
          </div>
        </div>
      </section>

      <SectionCard
        icon={DocumentTextIcon}
        title="Summary"
        bodyClassName="px-6 py-7 md:px-8 md:py-8"
      >
        <p className="text-sm leading-relaxed text-slate-600 md:text-base md:leading-loose">
          {content.summary}
        </p>
      </SectionCard>

      <SectionCard
        icon={ListChecksIcon}
        title="Action Items"
        action={
          <span className="shrink-0 text-sm font-medium text-slate-400">
            {completedCount} of {totalCount} completed
          </span>
        }
      >
        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ul className="flex flex-col divide-y divide-slate-100">
          {content.actionItems.map((item) => {
            const isChecked = checkedIds.has(item.id)
            return (
              <li key={item.id} className="group -mx-2 flex items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-pressed={isChecked}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    isChecked
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 text-transparent hover:border-slate-400'
                  }`}
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      isChecked ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}
                  >
                    {item.text}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar
                        initials={getOwnerInitials(item.owner)}
                        size={18}
                        tone={item.owner === 'Unassigned' ? 'bg-slate-100 text-slate-400' : undefined}
                      />
                      <span className="text-xs text-slate-500">{item.owner}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      <CalendarIcon className="h-3 w-3" />
                      {formatDate(item.dueDate)}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </SectionCard>

      <section className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
        <SectionCard icon={CheckCircleIcon} title="Key Decisions">
          <ul className="flex flex-col gap-4">
            {content.keyDecisions.map((decision, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                  {index + 1}
                </span>
                {decision}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard icon={CalendarIcon} title="Next Meeting Suggestions">
          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <CalendarIcon className="h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600/70">
                Suggested
              </p>
              <p className="text-sm font-semibold text-slate-800">{content.nextMeeting.date}</p>
            </div>
          </div>
          <ul className="mt-4 flex flex-col gap-2.5">
            {content.nextMeeting.agenda.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                {point}
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>
    </div>
  )
}

export default AnalysisResult
