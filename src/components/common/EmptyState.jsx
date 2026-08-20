function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
      {Icon && <Icon className="h-6 w-6 text-text-tertiary" />}
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      {description && <p className="text-sm text-text-tertiary">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export default EmptyState
