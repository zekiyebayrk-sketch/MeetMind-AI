// Serverless endpoint for speaker-diarized transcription via AssemblyAI.
//
// Deploy target: same convention as api/analyze.js — any platform that
// auto-detects files under /api as serverless functions (Vercel does this
// with zero config).
//
// SECURITY: this file runs server-side only, never in the browser.
// ASSEMBLYAI_API_KEY must be set as a server-side environment variable —
// never prefixed with VITE_, never committed, never sent to the client.
// Error responses below never include the key or any raw upstream response
// body, to avoid leaking server configuration.
//
// Contract:
//   POST body:  { audio: string, mimeType?: string }
//     `audio` is base64-encoded audio bytes. Sent as JSON (not raw binary)
//     to match the existing api/analyze.js request convention and avoid any
//     ambiguity around Vercel's body parsing for non-JSON content types.
//     This does cost ~33% size overhead versus raw binary — acceptable for
//     the short demo recordings this MVP targets (see size/time limits
//     below).
//   200 response: { transcript: string, speakers: number, durationSeconds: number|null }
//     `transcript` is formatted as:
//       Speaker 1: ...
//
//       Speaker 2: ...
//   Any error: { error: string } with a non-2xx status. This endpoint never
//   falls back to a fake/empty success — every failure is a real HTTP error.
//
// This output is designed to be passed as-is into the existing
// analyzeMeeting() / api/analyze.js pipeline as `transcript` text — nothing
// about that pipeline changes.

const ASSEMBLYAI_UPLOAD_URL = 'https://api.assemblyai.com/v2/upload'
const ASSEMBLYAI_TRANSCRIPT_URL = 'https://api.assemblyai.com/v2/transcript'
const POLL_INTERVAL_MS = 3000
const MAX_POLL_DURATION_MS = 50000 // leaves margin under the 60s function timeout below

// Vercel per-function execution time budget. Transcription (upload + submit
// + poll-until-done) routinely exceeds the platform default of 10s, even
// for short clips. If your plan doesn't allow 60s, lower this and
// MAX_POLL_DURATION_MS together, or the function will be killed mid-poll.
export const config = {
  maxDuration: 60,
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function decodeBase64Audio(audio) {
  try {
    const buffer = Buffer.from(audio, 'base64')
    return buffer.length > 0 ? buffer : null
  } catch {
    return null
  }
}

async function uploadAudio({ apiKey, audioBuffer }) {
  const response = await fetch(ASSEMBLYAI_UPLOAD_URL, {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'content-type': 'application/octet-stream',
    },
    body: audioBuffer,
  })

  if (!response.ok) {
    throw new Error(`AssemblyAI upload responded with status ${response.status}`)
  }

  const data = await response.json()
  if (!isNonEmptyString(data?.upload_url)) {
    throw new Error('AssemblyAI upload response missing upload_url')
  }
  return data.upload_url
}

async function submitTranscription({ apiKey, audioUrl }) {
  const response = await fetch(ASSEMBLYAI_TRANSCRIPT_URL, {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ audio_url: audioUrl, speaker_labels: true }),
  })

  if (!response.ok) {
    throw new Error(`AssemblyAI transcript submission responded with status ${response.status}`)
  }

  const data = await response.json()
  if (!isNonEmptyString(data?.id)) {
    throw new Error('AssemblyAI submission response missing id')
  }
  return data.id
}

async function pollTranscript({ apiKey, transcriptId }) {
  const deadline = Date.now() + MAX_POLL_DURATION_MS

  while (Date.now() < deadline) {
    const response = await fetch(`${ASSEMBLYAI_TRANSCRIPT_URL}/${transcriptId}`, {
      headers: { authorization: apiKey },
    })

    if (!response.ok) {
      throw new Error(`AssemblyAI status check responded with status ${response.status}`)
    }

    const data = await response.json()

    if (data.status === 'completed') return data
    if (data.status === 'error') {
      throw new Error(`AssemblyAI transcription failed: ${data.error || 'unknown error'}`)
    }
    // "queued" or "processing" — wait and check again.
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }

  const timeoutError = new Error('Transcription timed out')
  timeoutError.name = 'TranscriptionTimeoutError'
  throw timeoutError
}

/**
 * Converts AssemblyAI's diarized result into MeetMind's plain speaker-
 * labeled transcript format. Does not assume a fixed number of speakers —
 * AssemblyAI's own speaker identifiers (typically "A", "B", "C", ...) are
 * mapped to "Speaker 1", "Speaker 2", ... in order of first appearance.
 * Falls back to a single unlabeled block if diarization data is absent but
 * plain text is present, and to an empty result (treated as an error by the
 * caller) if there's nothing usable at all.
 */
function buildTranscriptFromResult(result) {
  if (Array.isArray(result.utterances) && result.utterances.length > 0) {
    const speakerLabels = new Map()
    let nextSpeakerNumber = 1

    const lines = result.utterances
      .filter((utterance) => isNonEmptyString(utterance?.text))
      .map((utterance) => {
        const rawSpeaker = utterance.speaker ?? 'Unknown'
        if (!speakerLabels.has(rawSpeaker)) {
          speakerLabels.set(rawSpeaker, `Speaker ${nextSpeakerNumber}`)
          nextSpeakerNumber += 1
        }
        return `${speakerLabels.get(rawSpeaker)}: ${utterance.text.trim()}`
      })

    return { transcript: lines.join('\n\n'), speakerCount: speakerLabels.size }
  }

  if (isNonEmptyString(result.text)) {
    return { transcript: `Speaker 1: ${result.text.trim()}`, speakerCount: 1 }
  }

  return { transcript: '', speakerCount: 0 }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.ASSEMBLYAI_API_KEY
  if (!apiKey) {
    res.status(501).json({
      error:
        'Transcription is not configured yet. Set ASSEMBLYAI_API_KEY as a server-side ' +
        'environment variable on your hosting platform to enable it.',
    })
    return
  }

  const { audio } = req.body ?? {}
  if (!isNonEmptyString(audio)) {
    res.status(400).json({ error: 'No audio data was provided to transcribe.' })
    return
  }

  const audioBuffer = decodeBase64Audio(audio)
  if (!audioBuffer) {
    res.status(400).json({ error: 'Audio data could not be decoded. Expected base64-encoded audio.' })
    return
  }

  try {
    const uploadUrl = await uploadAudio({ apiKey, audioBuffer })
    const transcriptId = await submitTranscription({ apiKey, audioUrl: uploadUrl })
    const result = await pollTranscript({ apiKey, transcriptId })

    const { transcript, speakerCount } = buildTranscriptFromResult(result)

    if (!isNonEmptyString(transcript)) {
      res.status(422).json({ error: 'Transcription completed but produced no usable transcript text.' })
      return
    }

    res.status(200).json({
      transcript,
      speakers: speakerCount,
      durationSeconds: typeof result.audio_duration === 'number' ? result.audio_duration : null,
    })
  } catch (error) {
    console.error('Transcription request failed:', error?.message || error)
    const status = error?.name === 'TranscriptionTimeoutError' ? 504 : 502
    res.status(status).json({ error: 'Transcription is temporarily unavailable.' })
  }
}
