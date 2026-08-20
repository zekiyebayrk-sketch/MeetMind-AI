import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_MAX_SECONDS = 180

// Ordered by preference. Chrome/Firefox/Edge support webm/opus; Safari does
// not support webm at all and only records mp4/aac. An empty string is a
// valid MediaRecorder mimeType — it tells the browser to pick its own
// default, used as a last-resort fallback.
const CANDIDATE_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/ogg;codecs=opus',
]

function pickSupportedMimeType() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return ''
  return CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

/**
 * Browser microphone recording via getUserMedia + MediaRecorder.
 *
 * recordingState: 'idle' | 'requesting-permission' | 'recording' | 'stopped'
 * error: { type: 'permission-denied'|'no-microphone'|'unsupported'|'unknown', message: string } | null
 */
export function useAudioRecorder({ maxSeconds = DEFAULT_MAX_SECONDS } = {}) {
  const [recordingState, setRecordingState] = useState('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const mimeTypeRef = useRef('')

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setAudioBlob(null)
    setElapsedSeconds(0)
    setRecordingState('requesting-permission')

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError({
        type: 'unsupported',
        message: 'Microphone recording is not supported in this browser.',
      })
      setRecordingState('idle')
      return
    }

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      const type =
        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
          ? 'permission-denied'
          : err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError'
            ? 'no-microphone'
            : 'unknown'
      setError({
        type,
        message:
          type === 'permission-denied'
            ? 'Microphone access was denied. Allow microphone access in your browser settings and try again.'
            : type === 'no-microphone'
              ? 'No microphone was found on this device.'
              : 'Could not access the microphone. Please try again.',
      })
      setRecordingState('idle')
      return
    }

    streamRef.current = stream
    chunksRef.current = []
    const mimeType = pickSupportedMimeType()
    mimeTypeRef.current = mimeType

    let recorder
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
    } catch {
      cleanupStream()
      setError({ type: 'unknown', message: 'Recording could not be started on this device.' })
      setRecordingState('idle')
      return
    }

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunksRef.current.push(event.data)
    }

    recorder.onerror = () => {
      clearTimer()
      cleanupStream()
      setError({ type: 'unknown', message: 'Recording failed unexpectedly. Please try again.' })
      setRecordingState('idle')
    }

    recorder.onstop = () => {
      clearTimer()
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || mimeTypeRef.current || 'audio/webm',
      })
      chunksRef.current = []
      cleanupStream()
      setAudioBlob(blob)
      setRecordingState('stopped')
    }

    mediaRecorderRef.current = recorder
    recorder.start()
    startTimeRef.current = Date.now()
    setRecordingState('recording')

    intervalRef.current = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setElapsedSeconds(seconds)
      if (seconds >= maxSeconds) {
        stopRecording()
      }
    }, 250)
  }, [cleanupStream, clearTimer, maxSeconds, stopRecording])

  const reset = useCallback(() => {
    clearTimer()
    cleanupStream()
    chunksRef.current = []
    mediaRecorderRef.current = null
    setRecordingState('idle')
    setElapsedSeconds(0)
    setAudioBlob(null)
    setError(null)
  }, [clearTimer, cleanupStream])

  // Ensure the microphone is always released and no timer keeps running if
  // the component unmounts mid-recording (e.g. user navigates away).
  useEffect(() => {
    return () => {
      clearTimer()
      cleanupStream()
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [clearTimer, cleanupStream])

  return {
    recordingState,
    elapsedSeconds,
    audioBlob,
    error,
    maxSeconds,
    startRecording,
    stopRecording,
    reset,
  }
}
