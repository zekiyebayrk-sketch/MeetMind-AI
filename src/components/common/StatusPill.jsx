const tones = {
  neutral: 'bg-tag-neutral-bg text-tag-neutral-text',
  success: 'bg-success-subtle-bg text-success-subtle-text',
  brand: 'bg-accent-subtle-bg text-accent-subtle-text',
  warning: 'bg-warning-subtle-bg text-warning-subtle-text',
  danger: 'bg-danger-subtle-bg text-danger-subtle-text',
}

function StatusPill({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export default StatusPill
