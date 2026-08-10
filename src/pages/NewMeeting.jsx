import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Button from '../components/common/Button'
import FormField from '../components/common/FormField'
import { DocumentTextIcon, UploadIcon } from '../components/common/icons'
import { analyzeMeeting } from '../services/analysis'
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

function NewMeeting() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [participantCount, setParticipantCount] = useState('')
  const [inputMode, setInputMode] = useState('transcript')
  const [transcript, setTranscript] = useState('')
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState(null)

  const hasContent = inputMode === 'transcript' ? transcript.trim().length > 0 : Boolean(file)
  const isAnalyzeDisabled = meetingTitle.trim().length === 0 || !hasContent || isAnalyzing

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

    setAnalyzeError(null)
    setIsAnalyzing(true)

    try {
      const { analysis, meta } = await analyzeMeeting({
        title: trimmedTitle,
        date,
        participants: participantsNumber,
        transcript: inputMode === 'transcript' ? transcript : '',
        source: inputMode,
        fileName: file?.name,
      })

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
      }

      saveCustomMeeting(newMeeting)
      navigate(`/analysis-result/${newMeeting.id}`)
    } catch (error) {
      console.error('Meeting analysis failed:', error)
      setAnalyzeError('Something went wrong generating the analysis. Please try again.')
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Header
        title="New Meeting"
        subtitle="Add a transcript or upload a recording to generate clear meeting insights."
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Meeting details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Meeting title"
                type="text"
                placeholder="e.g. Product Strategy Sync"
                value={meetingTitle}
                onChange={(event) => setMeetingTitle(event.target.value)}
                className="sm:col-span-2"
              />
              <FormField
                label="Date (optional)"
                type="date"
                value={meetingDate}
                onChange={(event) => setMeetingDate(event.target.value)}
              />
              <FormField
                label="Participants (optional)"
                type="number"
                min="0"
                placeholder="e.g. 6"
                value={participantCount}
                onChange={(event) => setParticipantCount(event.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-gray-900">Meeting content</h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {inputModes.map(({ id, label, description, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={inputMode === id}
                  onClick={() => setInputMode(id)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    inputMode === id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      inputMode === id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span
                      className={`block text-sm font-semibold ${
                        inputMode === id ? 'text-blue-700' : 'text-gray-900'
                      }`}
                    >
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">{description}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5">
              {inputMode === 'transcript' ? (
                <div>
                  <textarea
                    rows={10}
                    value={transcript}
                    onChange={(event) => setTranscript(event.target.value)}
                    placeholder={TRANSCRIPT_PLACEHOLDER}
                    className="w-full rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{transcript.length} characters</span>
                    <button
                      type="button"
                      onClick={() => setTranscript('')}
                      className="text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    onDragOver={(event) => {
                      event.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                      isDragging
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <UploadIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Drag and drop your audio file, or{' '}
                        <span className="text-blue-600">browse</span>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Supported formats: MP3, WAV, M4A
                      </p>
                      <p className="text-xs text-gray-500">Maximum file size: 100 MB</p>
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
                    <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3">
                      <span className="truncate text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="ml-3 shrink-0 text-xs font-medium text-gray-400 hover:text-gray-600"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 border-t border-gray-100 pt-6">
            <Button onClick={handleAnalyze} disabled={isAnalyzeDisabled}>
              {isAnalyzing && (
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              )}
              {isAnalyzing ? 'Analyzing…' : 'Analyze Meeting'}
            </Button>
            {analyzeError && <p className="text-sm text-rose-600">{analyzeError}</p>}
          </div>
        </div>
      </section>
    </div>
  )
}

export default NewMeeting
