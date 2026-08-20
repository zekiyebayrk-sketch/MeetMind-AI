import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/common/Avatar'
import StatusPill from '../components/common/StatusPill'
import SectionCard from '../components/common/SectionCard'
import {
  UsersIcon,
  ChevronLeftIcon,
  CheckIcon,
  CheckCircleIcon,
  CalendarIcon,
  ListChecksIcon,
  DocumentTextIcon,
  TrendUpIcon,
  ChatBubbleIcon,
} from '../components/common/icons'
import { meetings, categoryStyles, sentimentTones } from '../constants/meetings'
import { analysisContent, defaultAnalysisId } from '../constants/analysisContent'
import { formatDate, formatDuration } from '../utils/format'
import { getMeetingById } from '../utils/meetingsStore'

const DEFAULT_MEETING = meetings.find((item) => item.id === defaultAnalysisId)

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
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false)

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
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </button>

        <div>
          <StatusPill tone="brand">AI Meeting Analysis</StatusPill>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
            {meeting.title}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-text-secondary">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                categoryStyles[meeting.category] ?? 'bg-tag-neutral-bg text-tag-neutral-text'
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
      </div>

      <section className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex items-center gap-3 px-6 py-5">
          <ChatBubbleIcon className="h-[18px] w-[18px] shrink-0 text-text-secondary" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">Sentiment</p>
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
          <TrendUpIcon className="h-[18px] w-[18px] shrink-0 text-text-secondary" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
              Engagement Score
            </p>
            <p className="text-lg font-semibold tracking-tight text-text-primary">
              {content.overview.engagementScore}
              <span className="text-sm font-medium text-text-tertiary">/10</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-5">
          <UsersIcon className="h-[18px] w-[18px] shrink-0 text-text-secondary" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">Talk Time</p>
            <p className="text-sm font-semibold text-text-primary">{content.overview.talkTimeBalance}</p>
          </div>
        </div>
      </section>

      <SectionCard
        icon={DocumentTextIcon}
        title="Summary"
        bodyClassName="px-6 py-7 md:px-8 md:py-8"
      >
        <p className="text-sm leading-relaxed text-text-secondary md:text-base md:leading-loose">
          {content.summary}
        </p>
      </SectionCard>

      <SectionCard
        icon={ListChecksIcon}
        title="Action Items"
        action={
          <span className="shrink-0 text-sm font-medium text-text-tertiary">
            {completedCount} of {totalCount} completed
          </span>
        }
      >
        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-tag-neutral-bg">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ul className="flex flex-col divide-y divide-border">
          {content.actionItems.map((item) => {
            const isChecked = checkedIds.has(item.id)
            return (
              <li key={item.id} className="group -mx-2 flex items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-surface-secondary">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-pressed={isChecked}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    isChecked
                      ? 'border-accent bg-accent text-white'
                      : 'border-border text-transparent hover:border-text-tertiary'
                  }`}
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      isChecked ? 'text-text-tertiary line-through' : 'text-text-primary'
                    }`}
                  >
                    {item.text}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar
                        initials={getOwnerInitials(item.owner)}
                        size={18}
                        tone={item.owner === 'Unassigned' ? 'bg-tag-neutral-bg text-text-tertiary' : undefined}
                      />
                      <span className="text-xs text-text-secondary">{item.owner}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-tag-neutral-bg px-2 py-0.5 text-xs text-text-secondary">
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
              <li key={index} className="flex items-start gap-3 text-sm text-text-secondary">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-subtle-bg text-xs font-semibold text-accent-subtle-text">
                  {index + 1}
                </span>
                {decision}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard icon={CalendarIcon} title="Next Meeting Suggestions">
          <div className="flex items-center gap-3 rounded-xl border border-accent-subtle-bg bg-accent-subtle-bg px-4 py-3">
            <CalendarIcon className="h-4 w-4 shrink-0 text-accent" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-accent/70">
                Suggested
              </p>
              <p className="text-sm font-semibold text-text-primary">{content.nextMeeting.date}</p>
            </div>
          </div>
          <ul className="mt-4 flex flex-col gap-2.5">
            {content.nextMeeting.agenda.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-text-secondary">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-tertiary" />
                {point}
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>

      {meeting.transcript && (
        <SectionCard
          icon={ChatBubbleIcon}
          title="View Transcript"
          action={
            <button
              type="button"
              onClick={() => setIsTranscriptExpanded((current) => !current)}
              className="shrink-0 text-sm font-medium text-accent hover:text-accent-hover"
            >
              {isTranscriptExpanded ? 'Hide' : 'Show'}
            </button>
          }
        >
          {isTranscriptExpanded ? (
            <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg bg-surface-secondary p-4 text-sm leading-relaxed text-text-secondary">
              {meeting.transcript}
            </div>
          ) : (
            <p className="text-sm text-text-tertiary">
              Click &ldquo;Show&rdquo; to view the full speaker-labeled transcript.
            </p>
          )}
        </SectionCard>
      )}
    </div>
  )
}

export default AnalysisResult
