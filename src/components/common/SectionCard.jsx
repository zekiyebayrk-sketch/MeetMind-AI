function SectionCard({
  icon: Icon,
  title,
  action,
  children,
  className = '',
  bodyClassName = 'px-6 py-6 md:px-7',
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm ${className}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 md:px-7">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon className="h-5 w-5" />
          </span>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        </div>
        {action}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export default SectionCard
