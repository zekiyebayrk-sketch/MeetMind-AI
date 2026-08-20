function Header({ title, subtitle }) {
  return (
    <header>
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 text-sm text-text-secondary md:text-base">{subtitle}</p>}
    </header>
  )
}

export default Header
