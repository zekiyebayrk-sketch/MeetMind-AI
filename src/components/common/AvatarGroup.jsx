import Avatar from './Avatar'

function AvatarGroup({ initials = [], total, size = 28 }) {
  const overflow = total !== undefined ? total - initials.length : 0

  return (
    <div className="flex items-center -space-x-2">
      {initials.map((value, index) => (
        <Avatar key={`${value}-${index}`} initials={value} size={size} />
      ))}
      {overflow > 0 && (
        <div
          className="flex shrink-0 items-center justify-center rounded-full bg-tag-neutral-bg font-medium text-text-secondary ring-2 ring-surface"
          style={{ width: size, height: size, fontSize: size * 0.38 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}

export default AvatarGroup
