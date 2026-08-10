import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Button from '../components/common/Button'
import StatCard from '../components/common/StatCard'
import MeetingRow from '../components/common/MeetingRow'
import {
  CheckCircleIcon,
  ListChecksIcon,
  TimerIcon,
  SparklesIcon,
  PlusCircleIcon,
  ChevronRightIcon,
} from '../components/common/icons'
import { stats } from '../constants/dashboardData'
import { getAllMeetings } from '../utils/meetingsStore'

const statIcons = {
  meetingsAnalyzed: CheckCircleIcon,
  actionItemsFound: ListChecksIcon,
  hoursSaved: TimerIcon,
}

function Dashboard() {
  const recentMeetings = getAllMeetings().slice(0, 3)

  return (
    <div className="flex flex-col gap-8">
      <Header
        title="Good afternoon, Zekiye"
        subtitle="Turn every meeting into clear, actionable insights."
      />

      <section className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                Ready to analyze your next meeting?
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-500 md:text-base">
                Upload a recording or notes and MeetMind AI will summarize decisions, surface
                action items, and keep your team aligned.
              </p>
            </div>
          </div>
          <Button to="/new-meeting" className="w-full shrink-0 sm:w-auto">
            <PlusCircleIcon className="h-4 w-4" />
            New Meeting
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = statIcons[stat.id]
          return (
            <StatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              icon={<Icon className="h-5 w-5" />}
            />
          )
        })}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Recent Meetings</h2>
          <Link
            to="/history"
            className="group inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
            <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          {recentMeetings.map((meeting) => (
            <MeetingRow key={meeting.id} meeting={meeting} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Dashboard
