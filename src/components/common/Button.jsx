import { Link } from 'react-router-dom'

const variants = {
  primary:
    'rounded-lg px-4 py-2.5 bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:hover:bg-accent disabled:cursor-not-allowed',
  secondary:
    'rounded-lg px-4 py-2.5 bg-surface text-text-primary border border-border hover:bg-surface-secondary disabled:opacity-50 disabled:hover:bg-surface disabled:cursor-not-allowed',
  pill: 'rounded-full px-6 py-3 bg-accent text-white shadow-md hover:bg-accent-hover hover:shadow-lg disabled:opacity-40 disabled:hover:bg-accent disabled:hover:shadow-md disabled:cursor-not-allowed',
}

function Button({ children, to, onClick, variant = 'primary', className = '', ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 text-sm font-medium transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button
