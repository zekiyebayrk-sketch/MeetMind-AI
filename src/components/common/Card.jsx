// material is intentionally opt-in: leaving it unset preserves today's plain
// opaque card exactly (e.g. AnalysisResult's SectionCards), so only screens
// that explicitly ask for the quieter material system pick it up.
const materialClasses = {
  // Mostly opaque with a whisper of translucency + the faintest blur — meant
  // to be felt as depth, not read as "glass". The sidebar owns that language.
  medium: 'material-medium border border-border/25 bg-material-medium backdrop-blur-sm',
  soft: 'material-soft border border-border/20 bg-material-soft',
}

function Card({ children, className = '', material }) {
  const surface = material ? materialClasses[material] : 'border border-border bg-surface shadow-sm'

  return <div className={`overflow-hidden rounded-2xl ${surface} ${className}`}>{children}</div>
}

export default Card
