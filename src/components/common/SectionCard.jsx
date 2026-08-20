import Card from './Card'

function SectionCard({
  icon: Icon,
  title,
  action,
  children,
  className = '',
  bodyClassName = 'px-6 py-6 md:px-7',
  material,
}) {
  return (
    <Card material={material} className={className}>
      <header
        className={`flex items-center justify-between gap-3 border-b px-6 py-4 md:px-7 ${
          material ? 'border-border/30' : 'border-border'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="h-[18px] w-[18px] shrink-0 text-text-secondary" />
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        </div>
        {action}
      </header>
      <div className={bodyClassName}>{children}</div>
    </Card>
  )
}

export default SectionCard
