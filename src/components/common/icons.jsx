import { useId } from 'react'

function IconBase({ children, className = 'h-5 w-5', fill = 'none', stroke = 'currentColor', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function GridIcon({ filled = false, ...props }) {
  return (
    <IconBase {...(filled ? { fill: 'currentColor', stroke: 'none' } : {})} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </IconBase>
  )
}

// Filled variants of icons with internal strokes (plus/hands) use an SVG mask
// to "knock out" the glyph from a solid disc, mirroring how SF Symbols'
// `.fill` variants render — a solid shape reads as bolder/selected than an
// outline, without needing separate hand-drawn geometry per state.
export function PlusCircleIcon({ filled = false, className = 'h-5 w-5', ...props }) {
  const maskId = useId()
  if (!filled) {
    return (
      <IconBase className={className} {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </IconBase>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" {...props}>
      <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        <path d="M12 8v8M8 12h8" stroke="black" strokeWidth="1.8" strokeLinecap="round" />
      </mask>
      <circle cx="12" cy="12" r="9" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  )
}

export function ClockIcon({ filled = false, className = 'h-5 w-5', ...props }) {
  const maskId = useId()
  if (!filled) {
    return (
      <IconBase className={className} {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </IconBase>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" {...props}>
      <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        <path d="M12 7v5l3.5 2" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </mask>
      <circle cx="12" cy="12" r="9" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  )
}

export function SettingsIcon({ filled = false, ...props }) {
  const dotFill = filled ? 'currentColor' : 'none'
  return (
    <IconBase {...props}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <circle cx="14" cy="6" r="2" fill={dotFill} />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="8" cy="12" r="2" fill={dotFill} />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="16" cy="18" r="2" fill={dotFill} />
    </IconBase>
  )
}

export function CheckCircleIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </IconBase>
  )
}

export function ListChecksIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 6.5l1.5 1.5L8 5.5" />
      <line x1="11" y1="6" x2="20" y2="6" />
      <path d="M4 12.5l1.5 1.5L8 11.5" />
      <line x1="11" y1="12" x2="20" y2="12" />
      <path d="M4 18.5l1.5 1.5L8 17.5" />
      <line x1="11" y1="18" x2="20" y2="18" />
    </IconBase>
  )
}

export function TimerIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 1.5" />
      <path d="M9.5 2.5h5" />
      <path d="M12 2.5V5" />
    </IconBase>
  )
}

export function DocumentTextIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M7 3.5h7l4 4V20a1 1 0 01-1 1H7a1 1 0 01-1-1V4.5a1 1 0 011-1z" />
      <path d="M14 3.5V8h4.5" />
      <line x1="8.5" y1="12" x2="15.5" y2="12" />
      <line x1="8.5" y1="15.5" x2="15.5" y2="15.5" />
    </IconBase>
  )
}

export function CalendarIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
      <line x1="8" y1="3" x2="8" y2="6.5" />
      <line x1="16" y1="3" x2="16" y2="6.5" />
    </IconBase>
  )
}

export function UploadIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 15.5V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M4.5 15.5V19a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5v-3.5" />
    </IconBase>
  )
}

export function ChevronRightIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M9 5l7 7-7 7" />
    </IconBase>
  )
}

export function SearchIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.35-4.35" />
    </IconBase>
  )
}

export function UsersIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 19c.7-3.2 3-5 5.5-5s4.8 1.8 5.5 5" />
      <path d="M15.5 5.5a3.25 3.25 0 010 6.3" />
      <path d="M17 14.3c2.1.4 3.7 2 4.3 4.7" />
    </IconBase>
  )
}

export function TrendUpIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 16l5.5-5.5 3.5 3.5L20 7" />
      <path d="M14.5 7H20v5.5" />
    </IconBase>
  )
}

export function ChevronLeftIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M15 5l-7 7 7 7" />
    </IconBase>
  )
}

export function ChevronDownIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M5 9l7 7 7-7" />
    </IconBase>
  )
}

export function SunIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12h2.5M19 12h2.5M4.2 19.8l1.8-1.8M18 6l1.8-1.8" />
    </IconBase>
  )
}

export function MoonIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M20.5 14.5A8.5 8.5 0 1110.5 4.2a7 7 0 0010 10.3z" />
    </IconBase>
  )
}

export function MonitorIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="4.5" width="17" height="12" rx="1.5" />
      <line x1="9" y1="20.5" x2="15" y2="20.5" />
      <line x1="12" y1="16.5" x2="12" y2="20.5" />
    </IconBase>
  )
}

export function CheckIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </IconBase>
  )
}

export function MicrophoneIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0013 0" />
      <line x1="12" y1="17.5" x2="12" y2="21" />
      <line x1="8.5" y1="21" x2="15.5" y2="21" />
    </IconBase>
  )
}

export function StopIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </IconBase>
  )
}

export function ChatBubbleIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 5.5h16a1 1 0 011 1V15a1 1 0 01-1 1H9l-4 3.5V16H4a1 1 0 01-1-1V6.5a1 1 0 011-1z" />
      <line x1="7" y1="9.5" x2="17" y2="9.5" />
      <line x1="7" y1="12.5" x2="14" y2="12.5" />
    </IconBase>
  )
}
