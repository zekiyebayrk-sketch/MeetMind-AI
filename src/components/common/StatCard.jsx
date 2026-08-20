import Card from './Card'

function StatCard({ label, value, icon, trend }) {
  return (
    <Card material="soft" className="p-6">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary">{icon}</span>
        {trend && <span className="text-[13px] font-medium text-success-subtle-text">{trend}</span>}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary">{label}</p>
    </Card>
  )
}

export default StatCard
