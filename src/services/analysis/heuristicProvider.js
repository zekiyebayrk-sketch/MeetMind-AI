import { addDays, formatDate } from '../../utils/format'

const POSITIVE_WORDS = [
  'great',
  'good',
  'excited',
  'agree',
  'agreed',
  'perfect',
  'awesome',
  'happy',
  'positive',
  'excellent',
]
const NEGATIVE_WORDS = [
  'concern',
  'concerned',
  'issue',
  'problem',
  'blocked',
  'delay',
  'delayed',
  'risk',
  'worried',
  'difficult',
]

const DECISION_PATTERNS = [
  /\bwe(?:'ll| will)\b/i,
  /\blet's\b/i,
  /\bagreed\b/i,
  /\bdecided\b/i,
  /\bgoing with\b/i,
  /\bapproved\b/i,
  /\bmoving forward\b/i,
]

const ACTION_PATTERNS = [
  /\bi'll\b/i,
  /\bi will\b/i,
  /\bneed(?:s)? to\b/i,
  /\bshould\b/i,
  /\bwill send\b/i,
  /\bwill share\b/i,
  /\bwill follow up\b/i,
  /\bwill review\b/i,
  /\bwill loop in\b/i,
]

const RISK_PATTERNS = [
  /\bblocked\b/i,
  /\bblocker\b/i,
  /\brisk\b/i,
  /\bconcern(ed)?\b/i,
  /\bissue\b/i,
  /\bdelay(ed)?\b/i,
  /\bworried\b/i,
  /\bdifficult\b/i,
  /\bbehind schedule\b/i,
]

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function extractSpeakerLine(line) {
  const match = line.match(/^([A-Z][a-zA-Z]{1,20}):\s*(.+)$/)
  if (!match) return null
  return { speaker: match[1], text: match[2] }
}

function toInitials(name) {
  return name.slice(0, 2).toUpperCase()
}

/**
 * Local, deterministic analysis provider. Uses keyword/regex heuristics over
 * the raw transcript — no network calls, no external dependency. This is the
 * default provider and the fallback used whenever the AI provider is
 * unavailable or unconfigured (see ./index.js).
 *
 * @param {object} input
 * @param {string} input.title
 * @param {string} input.date - ISO date (YYYY-MM-DD)
 * @param {number} [input.participants]
 * @param {string} input.transcript
 * @param {'transcript'|'audio'} input.source
 * @param {string} [input.fileName]
 * @returns {Promise<{analysis: object, meta: object}>}
 */
export async function analyzeWithHeuristics({
  title,
  date,
  participants,
  transcript,
  source,
  fileName,
}) {
  const lines = (transcript || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const speakerLines = lines.map(extractSpeakerLine).filter(Boolean)
  const speakers = [...new Set(speakerLines.map((line) => line.speaker))]

  const sentences =
    speakerLines.length > 0
      ? speakerLines.flatMap((line) =>
          splitSentences(line.text).map((text) => ({ speaker: line.speaker, text })),
        )
      : splitSentences(transcript || '').map((text) => ({ speaker: null, text }))

  const substantive = sentences.filter((sentence) => sentence.text.split(' ').length >= 5)

  let summary
  if (substantive.length >= 2) {
    const summarySentences = substantive.slice(0, 3).map((sentence) => sentence.text)
    summary = `${title ? `In ${title}, ` : ''}the team covered ${summarySentences.length} main discussion points. ${summarySentences.join(' ')}`
  } else if (source === 'audio') {
    summary = `${title || 'This meeting'} was analyzed from an uploaded recording${
      fileName ? ` (${fileName})` : ''
    }. MeetMind AI identified the key discussion points and generated a set of suggested follow-ups below.`
  } else {
    summary = `${title || 'This meeting'} covered a brief discussion. MeetMind AI generated a starter set of follow-ups based on the content provided — add more detail to the transcript for a richer summary.`
  }

  let keyDecisions = substantive
    .filter((sentence) => DECISION_PATTERNS.some((pattern) => pattern.test(sentence.text)))
    .slice(0, 4)
    .map((sentence) => sentence.text)
  if (keyDecisions.length === 0) {
    keyDecisions = [
      `No explicit decisions were detected — review the ${
        source === 'audio' ? 'recording' : 'transcript'
      } and add them manually.`,
    ]
  }

  let actionCandidates = substantive.filter((sentence) =>
    ACTION_PATTERNS.some((pattern) => pattern.test(sentence.text)),
  )
  if (actionCandidates.length === 0) {
    actionCandidates = substantive.slice(0, 3)
  }
  const actionItems = actionCandidates.slice(0, 6).map((sentence, index) => ({
    id: `action-${index + 1}`,
    text:
      sentence.text.replace(/^(i'll|i will|we'll|we will)\s+/i, '').trim() || sentence.text,
    owner: sentence.speaker ?? 'Unassigned',
    dueDate: addDays(date, 3 + index * 2),
  }))
  if (actionItems.length === 0) {
    actionItems.push({
      id: 'action-1',
      text: 'Share meeting notes with the team',
      owner: 'Unassigned',
      dueDate: addDays(date, 3),
    })
  }

  let risks = substantive
    .filter((sentence) => RISK_PATTERNS.some((pattern) => pattern.test(sentence.text)))
    .slice(0, 3)
    .map((sentence) => sentence.text)
  if (risks.length === 0) {
    risks = ['No significant risks or blockers were flagged in this discussion.']
  }

  const nextMeeting = {
    date: `${formatDate(addDays(date, 7))} · 10:00 AM`,
    agenda: actionItems.slice(0, 3).map((item) => item.text),
  }

  const lowerText = (transcript || '').toLowerCase()
  const positiveHits = POSITIVE_WORDS.filter((word) => lowerText.includes(word)).length
  const negativeHits = NEGATIVE_WORDS.filter((word) => lowerText.includes(word)).length
  let sentiment = 'Neutral'
  if (positiveHits > negativeHits) sentiment = 'Positive'
  else if (negativeHits > positiveHits) sentiment = 'Mixed'

  const wordCount = (transcript || '').split(/\s+/).filter(Boolean).length
  const detectedParticipants = participants ?? Math.max(speakers.length, 1)
  const rawMinutes = Math.round(wordCount / 130) * 5
  const durationMinutes =
    source === 'audio' ? 30 : Math.min(90, Math.max(10, rawMinutes || 15))

  const engagementScore = Number(
    Math.min(9.6, Math.max(6.5, 7 + speakers.length * 0.3 + positiveHits * 0.2)).toFixed(1),
  )

  return {
    analysis: {
      summary,
      keyDecisions,
      actionItems,
      risks,
      nextMeeting,
      overview: {
        sentiment,
        engagementScore,
        talkTimeBalance:
          speakers.length > 1
            ? `Balanced across ${speakers.length} speakers`
            : 'Single speaker detected',
      },
    },
    meta: {
      durationMinutes,
      detectedParticipants,
      attendees: speakers.slice(0, 3).map(toInitials),
    },
  }
}
