/**
 * Client-side wrapper for the /api/transcribe endpoint (see api/transcribe.js
 * at the project root). Mirrors the same defensive-fetch pattern used by
 * src/services/analysis/aiProvider.js for /api/analyze — the client never
 * talks to AssemblyAI directly and never holds a transcription API key.
 */

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result
      const commaIndex = dataUrl.indexOf(',')
      resolve(commaIndex === -1 ? dataUrl : dataUrl.slice(commaIndex + 1))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Could not read audio data'))
    reader.readAsDataURL(blob)
  })
}

/**
 * @param {Blob} audioBlob
 * @returns {Promise<{transcript: string, speakers: number, durationSeconds: number|null}>}
 */
export async function transcribeAudio(audioBlob) {
  const audio = await blobToBase64(audioBlob)

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio, mimeType: audioBlob.type }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || `Transcription request failed with status ${response.status}`)
  }

  const result = await response.json()
  if (!result?.transcript) {
    throw new Error('Transcription response was missing a transcript')
  }
  return result
}
