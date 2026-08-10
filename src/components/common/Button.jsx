import { Link } from 'react-router-dom'

const variants = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:hover:bg-blue-300 disabled:cursor-not-allowed',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed',
}

function Button({ children, to, onClick, variant = 'primary', className = '', ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 ${variants[variant]} ${className}`

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
