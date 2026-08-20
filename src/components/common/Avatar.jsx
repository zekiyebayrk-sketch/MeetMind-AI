const palette = [
  'bg-avatar-blue-bg text-avatar-blue-text',
  'bg-avatar-violet-bg text-avatar-violet-text',
  'bg-avatar-amber-bg text-avatar-amber-text',
  'bg-avatar-emerald-bg text-avatar-emerald-text',
  'bg-avatar-rose-bg text-avatar-rose-text',
  'bg-avatar-teal-bg text-avatar-teal-text',
]

function toneFor(initials) {
  const code = initials.charCodeAt(0) || 0
  return palette[code % palette.length]
}

function Avatar({ initials = '?', size = 40, className = '', tone }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-surface ${
        tone ?? toneFor(initials)
      } ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  )
}

export default Avatar
