import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import MeetingRow from '../components/common/MeetingRow'
import {
  CheckCircleIcon,
  ListChecksIcon,
  TimerIcon,
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

      <Card material="medium" className="p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-text-primary md:text-2xl">
              Ready to analyze your next meeting?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-text-secondary md:text-base">
              Upload a recording or notes and MeetMind AI will summarize decisions, surface
              action items, and keep your team aligned.
            </p>
          </div>
          <Button to="/new-meeting" variant="pill" className="w-full shrink-0 sm:w-auto">
            <PlusCircleIcon className="h-4 w-4" />
            New Meeting
          </Button>
        </div>
      </Card>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = statIcons[stat.id]
          return (
            <StatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              icon={<Icon className="h-6 w-6" />}
            />
          )
        })}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">Recent Meetings</h2>
          <Link
            to="/history"
            className="group inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
          >
            View all
            <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <Card material="soft" className="mt-4 divide-y divide-border/40">
          {recentMeetings.map((meeting) => (
            <MeetingRow key={meeting.id} meeting={meeting} />
          ))}
        </Card>
      </section>
    </div>
  )
}

export default Dashboard
