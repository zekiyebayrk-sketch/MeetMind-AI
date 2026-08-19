// Serverless endpoint for real AI-powered meeting analysis.
//
// Deploy target: any platform that auto-detects files under /api as
// serverless functions (Vercel does this with zero config; Netlify and
// Cloudflare Pages need this moved into their own functions convention).
//
// SECURITY: this file runs server-side only, never in the browser.
// ANTHROPIC_API_KEY must be set as a server-side environment variable in
// the hosting platform's project settings — never prefixed with VITE_,
// never committed, never sent to the client. The React app (see
// src/services/analysis/aiProvider.js) only ever calls this endpoint; it
// never sees the key. Error responses below never include the key or any
// raw upstream response body, to avoid leaking server configuration.
//
// Contract:
//   POST body:  { title, date, participants, transcript, source, fileName }
//   200 response: { analysis: {...}, meta: {...} } — the same shape
//     src/services/analysis/heuristicProvider.js returns, i.e.
//     analysis: { summary, keyDecisions, actionItems, risks, nextMeeting, overview }
//     meta: { durationMinutes, detectedParticipants, attendees }
//   Any error: { error: string } with a non-2xx status
//
// On any failure — missing key, no transcript content, network error,
// non-2xx from Anthropic, malformed/incomplete model output — this responds
// with a non-2xx status. src/services/analysis/index.js's analyzeMeeting()
// catches that and transparently falls back to analyzeWithHeuristics(), so
// the UI never breaks even with this endpoint fully wired up.

const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001'
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const REQUEST_TIMEOUT_MS = 30000

const ANALYSIS_TOOL = {
  name: 'return_meeting_analysis',
  description: 'Return structured analysis of a meeting transcript, matching this exact schema.',
  input_schema: {
    type: 'object',
    properties: {
      summary: {
        type: 'string',
        description:
          'A 2-4 sentence summary of what was actually discussed, grounded only in the transcript.',
      },
      keyDecisions: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Explicit decisions made during the meeting. Return an empty array if none were made.',
      },
      actionItems: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'A short unique slug, e.g. "action-1".' },
            text: { type: 'string', description: 'The task, stated concisely.' },
            owner: {
              type: 'string',
              description:
                'Name of the person responsible, taken from the transcript. Use "Unassigned" if no owner is stated.',
            },
            dueDate: {
              type: 'string',
              description:
                'A suggested due date in YYYY-MM-DD format, a few days to two weeks after the ' +
                'meeting date. This is your suggestion, not an extracted fact — never claim a ' +
                'specific date was stated if it was not.',
            },
          },
          required: ['id', 'text', 'owner', 'dueDate'],
        },
        description: 'Concrete follow-up tasks. Return an empty array if none are identifiable.',
      },
      nextMeeting: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description:
              'A human-readable suggested next meeting date/time, e.g. "Tue, Aug 18, 2026 · 10:00 AM".',
          },
          agenda: {
            type: 'array',
            items: { type: 'string' },
            description: 'Up to 3 suggested agenda points for the next meeting.',
          },
        },
        required: ['date', 'agenda'],
      },
      overview: {
        type: 'object',
        properties: {
          sentiment: {
            type: 'string',
            enum: ['Positive', 'Neutral', 'Mixed'],
            description: 'Overall tone of the discussion.',
          },
          engagementScore: {
            type: 'number',
            description: 'A score from 0 to 10 reflecting how engaged participants seemed.',
          },
          talkTimeBalance: {
            type: 'string',
            description:
              'A short phrase describing participation balance, e.g. "Balanced across 4 speakers".',
          },
        },
        required: ['sentiment', 'engagementScore', 'talkTimeBalance'],
      },
      risks: {
        type: 'array',
        items: { type: 'string' },
        description: 'Risks or blockers explicitly raised in the discussion, if any.',
      },
    },
    required: ['summary', 'keyDecisions', 'actionItems', 'nextMeeting', 'overview'],
  },
}

const SYSTEM_PROMPT = `You are MeetMind AI, a meeting-analysis assistant. You will be given a meeting transcript and must extract a structured analysis by calling the return_meeting_analysis tool.

Rules:
- Only report decisions, action items, owners, sentiment, and risks that are explicitly stated or clearly and directly implied by the transcript.
- Never invent names, commitments, or facts that are not present in the transcript.
- If the transcript contains no clear decisions, action items, or risks, return empty arrays for those fields rather than inventing plausible-sounding content.
- If an action item has no clearly stated owner, use "Unassigned".
- Due dates you provide are your own reasonable suggestions, not facts extracted from the transcript — never claim a specific due date was stated if it was not.
- Always respond by calling the return_meeting_analysis tool exactly once, with no other text.`

function buildUserPrompt({ title, date, participants, transcript }) {
  const lines = [
    `Meeting title: ${title || 'Untitled meeting'}`,
    `Meeting date: ${date || 'unknown'}`,
  ]
  if (participants) lines.push(`Reported participant count: ${participants}`)
  lines.push('', 'Transcript:', transcript)
  return lines.join('\n')
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isIsoDateString(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(`${value}T00:00:00`).getTime())
  )
}

const VALID_SENTIMENTS = new Set(['Positive', 'Neutral', 'Mixed'])

/**
 * Strictly validates the model's tool-call input against MeetMind's analysis
 * schema, normalizing minor formatting along the way (trimming strings,
 * clamping the score). Throws on any structural problem — the caller treats
 * that the same as any other upstream failure and falls back.
 */
function validateAnalysis(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Model output was not an object')
  }
  if (!isNonEmptyString(raw.summary)) {
    throw new Error('Model output missing a valid summary')
  }
  if (
    !Array.isArray(raw.keyDecisions) ||
    !raw.keyDecisions.every((item) => typeof item === 'string')
  ) {
    throw new Error('Model output missing a valid keyDecisions array')
  }
  if (!Array.isArray(raw.actionItems)) {
    throw new Error('Model output missing a valid actionItems array')
  }

  const actionItems = raw.actionItems.map((item, index) => {
    if (
      !item ||
      typeof item !== 'object' ||
      !isNonEmptyString(item.text) ||
      !isNonEmptyString(item.owner) ||
      !isIsoDateString(item.dueDate)
    ) {
      throw new Error(`Model output has a malformed actionItems entry at index ${index}`)
    }
    return {
      id: isNonEmptyString(item.id) ? item.id : `action-${index + 1}`,
      text: item.text.trim(),
      owner: item.owner.trim(),
      dueDate: item.dueDate,
    }
  })

  if (
    !raw.nextMeeting ||
    typeof raw.nextMeeting !== 'object' ||
    !isNonEmptyString(raw.nextMeeting.date) ||
    !Array.isArray(raw.nextMeeting.agenda) ||
    !raw.nextMeeting.agenda.every((item) => typeof item === 'string')
  ) {
    throw new Error('Model output missing a valid nextMeeting object')
  }

  if (
    !raw.overview ||
    typeof raw.overview !== 'object' ||
    !VALID_SENTIMENTS.has(raw.overview.sentiment) ||
    typeof raw.overview.engagementScore !== 'number' ||
    !Number.isFinite(raw.overview.engagementScore) ||
    !isNonEmptyString(raw.overview.talkTimeBalance)
  ) {
    throw new Error('Model output missing a valid overview object')
  }

  const risks =
    Array.isArray(raw.risks) && raw.risks.every((item) => typeof item === 'string')
      ? raw.risks.map((item) => item.trim())
      : []

  return {
    summary: raw.summary.trim(),
    keyDecisions: raw.keyDecisions.map((item) => item.trim()),
    actionItems,
    risks,
    nextMeeting: {
      date: raw.nextMeeting.date.trim(),
      agenda: raw.nextMeeting.agenda.map((item) => item.trim()),
    },
    overview: {
      sentiment: raw.overview.sentiment,
      engagementScore: Math.min(10, Math.max(0, raw.overview.engagementScore)),
      talkTimeBalance: raw.overview.talkTimeBalance.trim(),
    },
  }
}

async function callAnthropic({ apiKey, title, date, participants, transcript }) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: buildUserPrompt({ title, date, participants, transcript }) },
        ],
        tools: [ANALYSIS_TOOL],
        tool_choice: { type: 'tool', name: ANALYSIS_TOOL.name },
      }),
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    // Never forward the upstream body verbatim to the client.
    throw new Error(`Anthropic API responded with status ${response.status}`)
  }

  const payload = await response.json()
  const toolUse = Array.isArray(payload?.content)
    ? payload.content.find(
        (block) => block?.type === 'tool_use' && block?.name === ANALYSIS_TOOL.name,
      )
    : null

  if (!toolUse || typeof toolUse.input !== 'object') {
    throw new Error('Anthropic response did not include the expected tool call')
  }

  return toolUse.input
}

function inferSpeakerCountFromTalkTime(talkTimeBalance) {
  const match = typeof talkTimeBalance === 'string' ? talkTimeBalance.match(/(\d+)\s*speakers?/i) : null
  return match ? Number(match[1]) : null
}

function deriveMeta({ participants, transcript, analysis }) {
  const wordCount = (transcript || '').split(/\s+/).filter(Boolean).length
  const rawMinutes = Math.round(wordCount / 130) * 5
  const durationMinutes = Math.min(90, Math.max(10, rawMinutes || 15))

  const speakerNames = new Set(
    analysis.actionItems
      .map((item) => item.owner)
      .filter((owner) => owner && owner !== 'Unassigned'),
  )

  // The action-item owner set only captures people who got assigned a task,
  // which undercounts whenever someone spoke but wasn't assigned anything.
  // overview.talkTimeBalance is written by the model from the full
  // transcript, so when it names a speaker count, that's a more complete
  // signal — use whichever source implies more participants.
  const talkTimeSpeakerCount = inferSpeakerCountFromTalkTime(analysis.overview?.talkTimeBalance)
  const impliedParticipants = Math.max(speakerNames.size, talkTimeSpeakerCount ?? 0, 1)
  const detectedParticipants = participants ?? impliedParticipants

  const attendees = [...speakerNames].slice(0, 3).map((name) => name.slice(0, 2).toUpperCase())

  return { durationMinutes, detectedParticipants, attendees }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(501).json({
      error:
        'AI analysis is not configured yet. Set ANTHROPIC_API_KEY as a server-side ' +
        'environment variable on your hosting platform to enable it.',
    })
    return
  }

  const { title, date, participants, transcript } = req.body ?? {}

  if (!isNonEmptyString(transcript)) {
    res.status(422).json({
      error:
        'No transcript content was provided to analyze. This is expected for audio-only ' +
        'submissions, since real transcription is not implemented yet.',
    })
    return
  }

  try {
    const rawAnalysis = await callAnthropic({ apiKey, title, date, participants, transcript })
    const analysis = validateAnalysis(rawAnalysis)
    const meta = deriveMeta({ participants, transcript, analysis })
    res.status(200).json({ analysis, meta })
  } catch (error) {
    console.error('AI analysis request failed:', error?.message || error)
    const status = error?.name === 'AbortError' ? 504 : 502
    res.status(status).json({ error: 'AI analysis is temporarily unavailable.' })
  }
}
