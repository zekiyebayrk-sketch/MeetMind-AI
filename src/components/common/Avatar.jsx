const palette = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
]

function toneFor(initials) {
  const code = initials.charCodeAt(0) || 0
  return palette[code % palette.length]
}

function Avatar({ initials = '?', size = 40, className = '', tone }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-white ${
        tone ?? toneFor(initials)
      } ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  )
}

export default Avatar
