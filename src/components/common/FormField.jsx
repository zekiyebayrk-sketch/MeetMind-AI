import { inputSurfaceClasses } from './inputStyles'

function FormField({ label, icon: Icon, className = '', ...inputProps }) {
  const isEmptyDate = inputProps.type === 'date' && !inputProps.value

  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        )}
        <input
          className={`${inputSurfaceClasses({ shape: 'pill', hasIcon: Boolean(Icon) })} ${
            isEmptyDate ? 'text-text-tertiary' : ''
          } ${
            inputProps.type === 'date'
              ? '[&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:transition-opacity hover:[&::-webkit-calendar-picker-indicator]:opacity-100 dark:[&::-webkit-calendar-picker-indicator]:invert'
              : ''
          }`}
          {...inputProps}
        />
      </div>
    </label>
  )
}

export default FormField
