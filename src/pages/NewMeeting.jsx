import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Button from '../components/common/Button'
import FormField from '../components/common/FormField'
import { inputSurfaceClasses } from '../components/common/inputStyles'
import {
  DocumentTextIcon,
  UploadIcon,
  MicrophoneIcon,
  StopIcon,
  CheckCircleIcon,
  CalendarIcon,
} from '../components/common/icons'
import { analyzeMeeting } from '../services/analysis'
import { transcribeAudio } from '../services/transcription'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { saveCustomMeeting } from '../utils/meetingsStore'
import { slugify, todayIso } from '../utils/format'

const TRANSCRIPT_PLACEHOLDER = `Alex: Good morning everyone, let's get started with today's product sync.
Jamie: Sure — first update is on the onboarding redesign, we finished the first prototype.
Alex: Great, what's the timeline for user testing?
Jamie: We're aiming to start testing next Tuesday and should have results by Friday.
Sam: I'll loop in the design team so they can review the prototype before testing begins.
Alex: Perfect. Let's also cover the Q3 roadmap priorities before we wrap up.`

const inputModes = [
  {
    id: 'record',
    label: 'Record Meeting',
    description: 'Record directly from your microphone',
    icon: MicrophoneIcon,
  },
  {
    id: 'transcript',
    label: 'Paste Transcript',
    description: 'Paste text from your notes or a transcript tool',
    icon: DocumentTextIcon,
  },
  {
    id: 'audio',
    label: 'Upload Audio',
    description: 'Upload a recording to transcribe automatically',
    icon: UploadIcon,
  },
]

const processingLabels = {
  transcribing: 'Transcribing meeting…',
  analyzing: 'Analyzing meeting…',
  preparing: 'Preparing results…',
}

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function NewMeeting() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const recorder = useAudioRecorder()

  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [participantCount, setParticipantCount] = useState('')
  const [inputMode, setInputMode] = useState('record')
  const [transcript, setTranscript] = useState('')
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [processingStage, setProcessingStage] = useState(null)
  const [processingError, setProcessingError] = useState(null)

  const hasContent =
    inputMode === 'transcript'
      ? transcript.trim().length > 0
      : inputMode === 'audio'
        ? Boolean(file)
        : Boolean(recorder.audioBlob)
  const isAnalyzeDisabled = meetingTitle.trim().length === 0 || !hasContent || processingStage !== null
  const isRecording = recorder.recordingState === 'recording'
  const isNearRecordingLimit = recorder.maxSeconds - recorder.elapsedSeconds <= 15

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) setFile(droppedFile)
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) setFile(selectedFile)
  }

  async function handleAnalyze() {
    const trimmedTitle = meetingTitle.trim()
    const date = meetingDate || todayIso()
    const participantsNumber = participantCount ? Number(participantCount) : undefined

    setProcessingError(null)

    let transcriptText = ''
    let effectiveSource = inputMode

    if (inputMode === 'record') {
      if (!recorder.audioBlob) return
      setProcessingStage('transcribing')
      try {
        const result = await transcribeAudio(recorder.audioBlob)
        transcriptText = result.transcript
      } catch (error) {
        console.error('Transcription failed:', error)
        setProcessingError('We could not transcribe your recording. Please try recording again.')
        setProcessingStage(null)
        return
      }
      effectiveSource = 'transcript'
    } else if (inputMode === 'audio') {
      if (!file) return
      setProcessingStage('transcribing')
      try {
        const result = await transcribeAudio(file)
        transcriptText = result.transcript
      } catch (error) {
        console.error('Transcription failed:', error)
        setProcessingError('We could not transcribe your audio file. Please try a different file.')
        setProcessingStage(null)
        return
      }
      effectiveSource = 'transcript'
    } else if (inputMode === 'transcript') {
      transcriptText = transcript
    }

    setProcessingStage('analyzing')
    try {
      const { analysis, meta } = await analyzeMeeting({
        title: trimmedTitle,
        date,
        participants: participantsNumber,
        transcript: effectiveSource === 'transcript' ? transcriptText : '',
        source: effectiveSource,
        fileName: file?.name,
      })

      setProcessingStage('preparing')

      const newMeeting = {
        id: `${slugify(trimmedTitle)}-${Date.now()}`,
        title: trimmedTitle,
        category: 'General',
        date,
        durationMinutes: meta.durationMinutes,
        actionItems: analysis.actionItems.length,
        keyDecisions: analysis.keyDecisions.length,
        participants: participantsNumber ?? meta.detectedParticipants,
        attendees: meta.attendees,
        status: 'Analyzed',
        analysis,
        ...(effectiveSource === 'transcript' && transcriptText ? { transcript: transcriptText } : {}),
      }

      saveCustomMeeting(newMeeting)
      navigate(`/analysis-result/${newMeeting.id}`)
    } catch (error) {
      console.error('Meeting analysis failed:', error)
      setProcessingError('Something went wrong generating the analysis. Please try again.')
      setProcessingStage(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Header
        title="New Meeting"
        subtitle="Record a meeting, paste a transcript, or upload audio to generate clear meeting insights."
      />

      <section className="rounded-2xl border border-border/60 bg-surface p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Meeting details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Meeting title"
                type="text"
                placeholder="Enter meeting title"
                value={meetingTitle}
                onChange={(event) => setMeetingTitle(event.target.value)}
                className="sm:col-span-2"
              />
              <FormField
                label="Date (optional)"
                type="date"
                icon={CalendarIcon}
                value={meetingDate}
                onChange={(event) => setMeetingDate(event.target.value)}
              />
              <FormField
                label="Participants (optional)"
                type="number"
                min="0"
                placeholder="Number of participants"
                value={participantCount}
                onChange={(event) => setParticipantCount(event.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-text-primary">Meeting content</h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {inputModes.map(({ id, label, description, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={inputMode === id}
                  disabled={isRecording && id !== 'record'}
                  onClick={() => setInputMode(id)}
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all active:scale-[0.98] ${
                    inputMode === id
                      ? 'border-accent/25 bg-accent-subtle-bg shadow-sm'
                      : 'border-transparent bg-surface-secondary hover:bg-surface hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-surface-secondary disabled:hover:shadow-none'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      inputMode === id ? 'text-accent' : 'text-text-secondary'
                    }`}
                  />
                  <span>
                    <span
                      className={`block text-sm font-semibold ${
                        inputMode === id ? 'text-accent-subtle-text' : 'text-text-primary'
                      }`}
                    >
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs text-text-secondary">{description}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5">
              {inputMode === 'record' && (
                <div>
                  <div className="flex flex-col items-center gap-4 rounded-2xl border border-transparent bg-surface-secondary px-6 py-10 text-center">
                    {recorder.recordingState === 'idle' && (
                      <>
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-subtle-bg text-accent-subtle-text">
                          <MicrophoneIcon className="h-6 w-6" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-text-primary">Ready to record</p>
                          <p className="mt-1 text-xs text-text-secondary">
                            Up to {formatClock(recorder.maxSeconds)} per recording for this demo.
                          </p>
                        </div>
                        <Button variant="pill" onClick={recorder.startRecording}>
                          <MicrophoneIcon className="h-4 w-4" />
                          Start Meeting
                        </Button>
                      </>
                    )}

                    {recorder.recordingState === 'requesting-permission' && (
                      <>
                        <span
                          aria-hidden="true"
                          className="h-6 w-6 animate-spin rounded-full border-2 border-accent-subtle-bg border-t-accent"
                        />
                        <p className="text-sm font-medium text-text-primary">
                          Requesting microphone access…
                        </p>
                      </>
                    )}

                    {isRecording && (
                      <>
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 animate-pulse rounded-full bg-danger"
                          />
                          <span className="text-sm font-semibold text-danger">Recording</span>
                        </div>
                        <p
                          className={`text-3xl font-semibold tabular-nums ${
                            isNearRecordingLimit ? 'text-danger' : 'text-text-primary'
                          }`}
                        >
                          {formatClock(recorder.elapsedSeconds)}
                        </p>
                        {isNearRecordingLimit ? (
                          <p className="text-xs font-medium text-danger">
                            Recording will stop automatically soon
                          </p>
                        ) : (
                          <p className="text-xs text-text-secondary">Max {formatClock(recorder.maxSeconds)}</p>
                        )}
                        <Button variant="secondary" onClick={recorder.stopRecording}>
                          <StopIcon className="h-4 w-4" />
                          Stop Meeting
                        </Button>
                      </>
                    )}

                    {recorder.recordingState === 'stopped' && recorder.audioBlob && (
                      <>
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-subtle-bg text-success-subtle-text">
                          <CheckCircleIcon className="h-6 w-6" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            Recording captured — {formatClock(recorder.elapsedSeconds)}
                          </p>
                          <p className="mt-1 text-xs text-text-secondary">
                            Ready to analyze, or record again.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={recorder.reset}
                          className="text-xs font-medium text-text-secondary hover:text-text-primary"
                        >
                          Record again
                        </button>
                      </>
                    )}
                  </div>
                  {recorder.error && (
                    <p className="mt-3 text-sm text-danger">{recorder.error.message}</p>
                  )}
                </div>
              )}

              {inputMode === 'transcript' && (
                <div>
                  <textarea
                    rows={10}
                    value={transcript}
                    onChange={(event) => setTranscript(event.target.value)}
                    placeholder={TRANSCRIPT_PLACEHOLDER}
                    className={`${inputSurfaceClasses({ shape: 'soft' })} resize-none`}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-text-tertiary">{transcript.length} characters</span>
                    <button
                      type="button"
                      onClick={() => setTranscript('')}
                      className="text-xs font-medium text-text-secondary hover:text-text-primary"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {inputMode === 'audio' && (
                <div>
                  <div
                    onDragOver={(event) => {
                      event.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all ${
                      isDragging
                        ? 'border-accent bg-accent-subtle-bg'
                        : 'border-border/60 bg-surface-secondary hover:bg-tag-neutral-bg'
                    }`}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-subtle-bg text-accent-subtle-text">
                      <UploadIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Drag and drop your audio file, or{' '}
                        <span className="text-accent">browse</span>
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Supported formats: MP3, WAV, M4A
                      </p>
                      <p className="text-xs text-text-secondary">Maximum file size: 100 MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-m4a"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  {file && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-surface-secondary px-4 py-3">
                      <span className="truncate text-sm text-text-primary">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="ml-3 shrink-0 text-xs font-medium text-text-tertiary hover:text-text-secondary"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 border-t border-border pt-6">
            <Button variant="pill" onClick={handleAnalyze} disabled={isAnalyzeDisabled}>
              {processingStage && (
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              )}
              {processingStage ? processingLabels[processingStage] : 'Analyze Meeting'}
            </Button>
            {processingError && <p className="text-sm text-danger">{processingError}</p>}
          </div>
        </div>
      </section>
    </div>
  )
}

export default NewMeeting
