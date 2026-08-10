/**
 * AI-powered analysis provider.
 *
 * This calls MeetMind's own `/api/analyze` server-side endpoint (see
 * /api/analyze.js at the project root) — the client never talks to Anthropic
 * directly and never holds an API key. That endpoint is currently a
 * documented placeholder: it always responds "not configured" until a real
 * ANTHROPIC_API_KEY is set as a server-side environment variable on whatever
 * platform hosts it, and until the actual Anthropic call is implemented
 * there.
 *
 * This function is only invoked when VITE_ENABLE_AI_ANALYSIS=true (see
 * ./index.js). During local `vite dev`, /api routes aren't served at all, so
 * this fails fast with a network error either way, and the caller in
 * ./index.js transparently falls back to the local heuristic provider.
 *
 * @param {object} input Same shape as analyzeWithHeuristics's input.
 * @returns {Promise<{analysis: object, meta: object}>}
 */
export async function analyzeWithAI(input) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || `AI analysis request failed with status ${response.status}`)
  }

  const result = await response.json()
  if (!result?.analysis || !result?.meta) {
    throw new Error('AI analysis response was missing expected fields')
  }
  return result
}
