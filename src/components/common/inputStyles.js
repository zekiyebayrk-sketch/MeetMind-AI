// Single source of truth for the app's Apple-style "soft field" look — used
// by FormField's input, the History search bar, and the transcript textarea,
// so all form/search controls stay one visual family instead of each screen
// hand-rolling its own version of the same recipe.
//
// shape: 'pill' for single-line controls (title, date, participants, search)
//        'soft' for multi-line surfaces (textarea) — a full pill reads oddly
//        once a control wraps to multiple rows, so it gets a large-but-not-
//        fully-round radius instead.
export function inputSurfaceClasses({ shape = 'pill', hasIcon = false } = {}) {
  const radius = shape === 'pill' ? 'rounded-full' : 'rounded-2xl'
  const horizontalPadding = hasIcon ? 'pl-11 pr-5' : 'px-5'

  return `w-full border border-border/60 bg-surface-secondary py-3 text-[15px] text-text-primary shadow-sm outline-none transition-all placeholder:text-text-tertiary focus:border-accent/40 focus:bg-surface focus:ring-4 focus:ring-accent/10 ${radius} ${horizontalPadding}`
}
