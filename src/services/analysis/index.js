import { analyzeWithHeuristics } from './heuristicProvider'
import { analyzeWithAI } from './aiProvider'

// Plain boolean feature flag — safe to bundle client-side, unlike an API key.
// Flip this on only once /api/analyze is actually deployed with a real
// ANTHROPIC_API_KEY configured server-side (see aiProvider.js and
// /api/analyze.js). Off by default, so the app runs fully keyless.
const isAIProviderEnabled = import.meta.env.VITE_ENABLE_AI_ANALYSIS === 'true'

/**
 * Single entry point for meeting analysis. Provider-agnostic: callers don't
 * need to know whether the result came from a real LLM or the local
 * heuristic fallback — both return the same shape.
 *
 * If the AI provider is enabled (see aiProvider.js) it's tried first and
 * any failure (network, malformed response, endpoint not deployed, etc.)
 * transparently falls back to the deterministic local provider so the UI
 * never breaks.
 *
 * @param {object} input
 * @param {string} input.title
 * @param {string} input.date
 * @param {number} [input.participants]
 * @param {string} input.transcript
 * @param {'transcript'|'audio'} input.source
 * @param {string} [input.fileName]
 * @returns {Promise<{analysis: object, meta: object}>}
 */
export async function analyzeMeeting(input) {
  if (isAIProviderEnabled) {
    try {
      return await analyzeWithAI(input)
    } catch (error) {
      console.warn('AI analysis failed, falling back to local heuristics:', error)
    }
  }
  return analyzeWithHeuristics(input)
}
