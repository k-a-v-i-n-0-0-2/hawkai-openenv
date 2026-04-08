import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, Send, Bot, Plus, Menu, Clock, MessageSquare, Trash2, ChevronDown, Pencil, Check } from 'lucide-react'
import { createPortal } from 'react-dom'
import { API_BASE_URL } from '../config'
import { format } from 'date-fns'
import './DietChat.css'

interface DietChatProps {
  onClose: () => void
}

type MessageRole = 'bot' | 'user'

interface Message {
  role: MessageRole
  text: string
  type?: 'text' | 'diet-plan' | 'action-buttons'
}

/* ── Per-session data stored in localStorage ── */
interface SessionSnapshot {
  sessionId: string
  customName?: string  // user-defined label
  messages: Message[]
  userData: Record<string, string>
  phase: ChatPhase
  stepIdx: number
  dietPlan: string
  createdAt: string    // ISO string
  updatedAt: string    // ISO string
}

/* ── Conversation flow steps ── */
const STEPS = [
  { key: 'age', question: "👋 Hey there! I'm **HawkAI**, your personal diet planner.\n\nLet's build your customized diet plan. First, how old are you?", type: 'input' as const, placeholder: 'Enter your age' },
  { key: 'gender', question: "Got it! What's your gender?", type: 'options' as const, options: ['Male', 'Female'] },
  { key: 'height', question: "What's your height in **cm**?", type: 'input' as const, placeholder: 'e.g. 170' },
  { key: 'weight', question: "And your current weight in **kg**?", type: 'input' as const, placeholder: 'e.g. 70' },
  { key: 'body_fat', question: "Body fat %? (type 'skip' if unsure)", type: 'input' as const, placeholder: 'e.g. 20 or skip' },
  { key: 'goal', question: "What's your primary fitness goal?", type: 'options' as const, options: ['Fat Loss', 'Muscle Gain', 'Maintenance', 'Body Recomposition'] },
  { key: 'target_weight', question: "Any target weight? (in kg, or type 'skip')", type: 'input' as const, placeholder: 'e.g. 65 or skip' },
  { key: 'activity_level', question: "How active are you daily?", type: 'options' as const, options: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'] },
  { key: 'workout_days', question: "Workout days per week?", type: 'options' as const, options: ['0', '1-2', '3-4', '5-6', '7'] },
  { key: 'workout_type', question: "Workout type?", type: 'options' as const, options: ['Strength', 'Cardio', 'HIIT', 'Mixed', 'Yoga'] },
  { key: 'workout_duration', question: "Duration per session?", type: 'options' as const, options: ['15-30 mins', '30-45 mins', '45-60 mins', '60+ mins'] },
  { key: 'experience', question: "Experience level?", type: 'options' as const, options: ['Beginner', 'Intermediate', 'Advanced'] },
  { key: 'sleep_hours', question: "Sleep hours per night?", type: 'options' as const, options: ['4-5', '6-7', '7-8', '8+'] },
  { key: 'stress_level', question: "Stress level?", type: 'options' as const, options: ['Low', 'Medium', 'High'] },
  { key: 'diet_type', question: "Diet preference?", type: 'options' as const, options: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'] },
  { key: 'allergies', question: "Any food allergies? (or type 'None')", type: 'input' as const, placeholder: 'e.g. Nuts, Dairy or None' },
  { key: 'cuisine', question: "Cuisine preference?", type: 'options' as const, options: ['South Indian', 'North Indian', 'Indian', 'Continental', 'Mixed'] },
  { key: 'state', question: "Which **Indian State** are you from? (e.g. Tamil Nadu, Punjab, etc.)", type: 'input' as const, placeholder: 'Enter your state' },
  { key: 'health_conditions', question: "Health conditions? (or 'None')", type: 'input' as const, placeholder: 'e.g. Diabetes, PCOD or None' },
  { key: 'meals_per_day', question: "Meals per day?", type: 'options' as const, options: ['3', '4', '5', '6'] },
  { key: 'fasting', question: "Intermittent fasting?", type: 'options' as const, options: ['No', '16:8', '18:6', '20:4'] },
  { key: 'blood_report', question: "📋 **Optional — Blood Report**\n\nWould you like to submit blood test values for more accurate recommendations?\n\n(I can analyze Hemoglobin, Vitamin D, B12, Iron, Cholesterol, Fasting Sugar, TSH, Uric Acid)", type: 'options' as const, options: ['Yes, add blood report', 'Skip, generate diet'] },
]

const BLOOD_FIELDS = [
  { key: 'hemoglobin', label: 'Hemoglobin (g/dL)', placeholder: 'e.g. 14.5' },
  { key: 'vitamin_d', label: 'Vitamin D (ng/mL)', placeholder: 'e.g. 25' },
  { key: 'vitamin_b12', label: 'Vitamin B12 (pg/mL)', placeholder: 'e.g. 350' },
  { key: 'iron', label: 'Iron (μg/dL)', placeholder: 'e.g. 90' },
  { key: 'cholesterol_total', label: 'Total Cholesterol (mg/dL)', placeholder: 'e.g. 180' },
  { key: 'sugar_fasting', label: 'Fasting Sugar (mg/dL)', placeholder: 'e.g. 95' },
  { key: 'thyroid_tsh', label: 'TSH (mIU/L)', placeholder: 'e.g. 2.5' },
  { key: 'uric_acid', label: 'Uric Acid (mg/dL)', placeholder: 'e.g. 5.5' },
]

type ChatPhase = 'survey' | 'blood-form' | 'generating' | 'chat'

// ─────────────────────────────────────────────────────────────
//  localStorage helpers  (all sessions stored individually)
// ─────────────────────────────────────────────────────────────

const LS_INDEX_KEY = 'hawkai_session_index'   // string[] of session IDs newest-first
const LS_ACTIVE_KEY = 'hawkai_active_session'  // current active session ID

function getIndex(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_INDEX_KEY) || '[]') } catch { return [] }
}

function saveIndex(ids: string[]) {
  localStorage.setItem(LS_INDEX_KEY, JSON.stringify(ids))
}

function readSnapshot(sid: string): SessionSnapshot | null {
  try {
    const raw = localStorage.getItem(`hawkai_session_${sid}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function writeSnapshot(snap: SessionSnapshot) {
  snap.updatedAt = new Date().toISOString()
  localStorage.setItem(`hawkai_session_${snap.sessionId}`, JSON.stringify(snap))
  // Ensure it's in the index (front = newest)
  const idx = getIndex().filter(id => id !== snap.sessionId)
  saveIndex([snap.sessionId, ...idx])
}

function deleteSnapshot(sid: string) {
  localStorage.removeItem(`hawkai_session_${sid}`)
  saveIndex(getIndex().filter(id => id !== sid))
}

function createFreshSnapshot(sid: string): SessionSnapshot {
  return {
    sessionId: sid,
    customName: '',
    messages: [{ role: 'bot', text: STEPS[0].question }],
    userData: {},
    phase: 'survey',
    stepIdx: 0,
    dietPlan: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function getOrCreateActiveSnapshot(): SessionSnapshot {
  const activeSid = localStorage.getItem(LS_ACTIVE_KEY)
  if (activeSid) {
    const snap = readSnapshot(activeSid)
    if (snap) return snap
  }
  // Fresh session
  const sid = `session_${Date.now()}`
  const snap = createFreshSnapshot(sid)
  writeSnapshot(snap)
  localStorage.setItem(LS_ACTIVE_KEY, sid)
  return snap
}

/** Derive a human-readable label for a session */
function sessionLabel(snap: SessionSnapshot): string {
  if (snap.customName && snap.customName.trim()) return snap.customName.trim()
  if (snap.userData?.goal) return snap.userData.goal
  if (snap.phase === 'survey' && snap.stepIdx > 0) return `Survey (step ${snap.stepIdx + 1}/${STEPS.length})`
  return 'New Chat'
}

/** Format a date nicely — today shows time only, older shows date */
function smartDate(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const isThisYear = d.getFullYear() === now.getFullYear()
    if (isToday) return format(d, "'Today,' h:mm a")
    if (isThisYear) return format(d, 'MMM d, h:mm a')
    return format(d, 'MMM d yyyy, h:mm a')
  } catch { return 'Unknown' }
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

export default function DietChat({ onClose }: DietChatProps) {

  // Load active snapshot once on mount
  const [snap, setSnap] = useState<SessionSnapshot>(() => getOrCreateActiveSnapshot())

  // Derived shortcuts (always kept in sync via setSnap)
  const sessionId  = snap.sessionId
  const messages   = snap.messages
  const userData   = snap.userData
  const phase      = snap.phase
  const stepIdx    = snap.stepIdx
  const storedDietPlan = snap.dietPlan

  // Local-only UI state
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading]   = useState(false)
  const [bloodData, setBloodData] = useState<Record<string, string>>({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  // Rename state
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameVal, setRenameVal]   = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  // History list derived from localStorage index
  const [historyList, setHistoryList] = useState<SessionSnapshot[]>([])

  // Refs
  const chatEndRef       = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const userNearBottom   = useRef(true)

  // ── Persist snap on every change ──
  useEffect(() => {
    writeSnapshot(snap)
    localStorage.setItem(LS_ACTIVE_KEY, snap.sessionId)
  }, [snap])

  // ── Load history from localStorage ──
  const refreshHistory = useCallback(() => {
    const ids = getIndex()
    const snaps = ids.map(id => readSnapshot(id)).filter(Boolean) as SessionSnapshot[]
    setHistoryList(snaps)
  }, [])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory, sessionId])

  // ── Convenience updaters ──
  function updateSnap(partial: Partial<Omit<SessionSnapshot, 'sessionId' | 'createdAt'>>) {
    setSnap(prev => ({ ...prev, ...partial }))
  }

  // ── Scroll helpers ──
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    userNearBottom.current = true
    setShowScrollBtn(false)
  }, [])

  const handleChatScroll = useCallback(() => {
    const el = chatContainerRef.current
    if (!el) return
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 150
    userNearBottom.current = near
    setShowScrollBtn(!near)
  }, [])

  useEffect(() => {
    if (phase !== 'generating' && userNearBottom.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, phase])

  // ─────────────────────────────────────────────
  //  Session control
  // ─────────────────────────────────────────────

  function startNewChat() {
    if (loading) return
    // Save current session first (already saved via effect)
    const newId = `session_${Date.now()}`
    const newSnap = createFreshSnapshot(newId)
    writeSnapshot(newSnap)
    localStorage.setItem(LS_ACTIVE_KEY, newId)
    setSnap(newSnap)
    setInputVal('')
    setBloodData({})
    setIsSidebarOpen(false)
    refreshHistory()
  }

  function loadSession(sid: string) {
    if (loading || sid === sessionId) {
      setIsSidebarOpen(false)
      return
    }
    const target = readSnapshot(sid)
    if (!target) return
    setSnap(target)
    localStorage.setItem(LS_ACTIVE_KEY, sid)
    setInputVal('')
    setBloodData({})
    setIsSidebarOpen(false)
  }

  function handleDeleteSession(sid: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!window.confirm('Delete this chat?')) return
    deleteSnapshot(sid)
    if (sid === sessionId) startNewChat()
    else refreshHistory()
  }

  // ─────────────────────────────────────────────
  //  Interaction handlers
  // ─────────────────────────────────────────────

  function handleAnswer(answer: string) {
    if (loading) return
    const trimmed = answer.trim()
    if (!trimmed) return

    const newMsgs: Message[] = [...messages, { role: 'user', text: trimmed }]
    const currentStep = STEPS[stepIdx]
    const newData = { ...userData, [currentStep.key]: trimmed === 'skip' ? 'Not provided' : trimmed }
    setInputVal('')

    if (currentStep.key === 'blood_report') {
      if (trimmed.toLowerCase().includes('yes')) {
        const withBot: Message[] = [...newMsgs, { role: 'bot', text: '🩸 Please fill in your blood report values below.' }]
        updateSnap({ messages: withBot, userData: newData, phase: 'blood-form', stepIdx: stepIdx + 1 })
      } else {
        const withBot: Message[] = [...newMsgs, { role: 'bot', text: '🧠 Generating your diet plan...' }]
        updateSnap({ messages: withBot, userData: newData, stepIdx: stepIdx + 1 })
        generateDiet(newData, null, withBot)
      }
      return
    }

    const nextIdx = stepIdx + 1
    if (nextIdx < STEPS.length) {
      const withBot: Message[] = [...newMsgs, { role: 'bot', text: STEPS[nextIdx].question }]
      updateSnap({ messages: withBot, userData: newData, stepIdx: nextIdx })
    } else {
      const withBot: Message[] = [...newMsgs, { role: 'bot', text: '🧠 Analyzing and generating your plan...' }]
      updateSnap({ messages: withBot, userData: newData, stepIdx: nextIdx })
      generateDiet(newData, null, withBot)
    }
  }

  async function generateDiet(
    data: Record<string, string>,
    bloodReport: Record<string, string> | null,
    currentMsgs: Message[]
  ) {
    setLoading(true)
    updateSnap({ phase: 'generating' })

    try {
      const res = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, blood_report: bloodReport, session_id: sessionId }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      // Add streaming diet-plan bubble
      const withPlan: Message[] = [...currentMsgs, { role: 'bot', text: '', type: 'diet-plan' }]
      updateSnap({ messages: withPlan })

      if (reader) {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          fullText += chunk
          setSnap(prev => {
            const updated = [...prev.messages]
            const last = updated[updated.length - 1]
            if (last && last.type === 'diet-plan') last.text = fullText
            return { ...prev, messages: updated }
          })
        }

        const finalMsgs: Message[] = [
          ...withPlan.slice(0, -1),
          { role: 'bot', text: fullText, type: 'diet-plan' },
          { role: 'bot', text: '✅ Your diet plan is ready! Ask me anything or start a new plan.', type: 'action-buttons' }
        ]
        updateSnap({ messages: finalMsgs, phase: 'chat', dietPlan: fullText })
        refreshHistory()
      }
    } catch (e) {
      updateSnap({
        messages: [...currentMsgs, { role: 'bot', text: '❌ Connection error. Please try again.' }],
        phase: 'chat'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleChatMessage(text: string) {
    if (!text.trim() || loading) return
    const trimmed = text.trim()
    setInputVal('')

    const newMsgs: Message[] = [...messages, { role: 'user', text: trimmed }]
    updateSnap({ messages: newMsgs })
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/tracker/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, date: format(new Date(), 'yyyy-MM-dd'), session_id: sessionId }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        const withBot: Message[] = [...newMsgs, { role: 'bot', text: '' }]
        updateSnap({ messages: withBot })

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const dData = JSON.parse(line.slice(6))
                if (dData.text) {
                  fullText += dData.text
                  setSnap(prev => {
                    const updated = [...prev.messages]
                    const last = updated[updated.length - 1]
                    if (last && last.role === 'bot') last.text = fullText
                    return { ...prev, messages: updated }
                  })
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (e) {
      updateSnap({ messages: [...messages, { role: 'user', text: trimmed }, { role: 'bot', text: '❌ Failed to connect.' }] })
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────

  return createPortal(
    <div className="fixed inset-0 z-[60] flex hawkai-chat-root bg-[#0a0a0a]">

      {/* ── Mobile Sidebar Overlay ── */}
      <div
        className={`hawkai-sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`hawkai-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#ea580c] flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="sidebar-brand-text">HawkAI</span>
        </div>

        {/* New Chat Button */}
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={startNewChat}>
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* History List */}
        <div className="history-list">
          <div className="history-section-label">Chat History</div>

          {historyList.length === 0 ? (
            <div className="history-empty">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No chats yet.</p>
              <p className="text-[11px] mt-1">Start your first diet plan!</p>
            </div>
          ) : (
            historyList.map(item => (
              <div
                key={item.sessionId}
                className={`history-item group ${item.sessionId === sessionId ? 'active' : ''}`}
                onClick={() => renamingId !== item.sessionId && loadSession(item.sessionId)}
              >
                {/* ─ Title row ─ */}
                {renamingId === item.sessionId ? (
                  <form
                    className="flex items-center gap-1 w-full"
                    onSubmit={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      const trimmed = renameVal.trim()
                      // save customName into snapshot
                      const updated = readSnapshot(item.sessionId)
                      if (updated) {
                        updated.customName = trimmed
                        writeSnapshot(updated)
                        if (item.sessionId === sessionId) {
                          setSnap(prev => ({ ...prev, customName: trimmed }))
                        }
                        refreshHistory()
                      }
                      setRenamingId(null)
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <input
                      ref={renameInputRef}
                      className="rename-input"
                      value={renameVal}
                      onChange={e => setRenameVal(e.target.value)}
                      onBlur={() => setRenamingId(null)}
                      onKeyDown={e => e.key === 'Escape' && setRenamingId(null)}
                      placeholder="Enter a name..."
                      maxLength={40}
                      autoFocus
                    />
                    <button type="submit" className="rename-confirm-btn" onMouseDown={e => e.preventDefault()}>
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <div className="flex justify-between items-start w-full gap-1">
                    <span className="history-item-title">{sessionLabel(item)}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        className="history-action-btn"
                        title="Rename"
                        onClick={e => {
                          e.stopPropagation()
                          setRenamingId(item.sessionId)
                          setRenameVal(item.customName || sessionLabel(item))
                          setTimeout(() => renameInputRef.current?.focus(), 50)
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        className="history-action-btn danger"
                        title="Delete"
                        onClick={e => handleDeleteSession(item.sessionId, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─ Meta row ─ */}
                <div className="history-item-meta">
                  <span className={`history-badge ${item.phase === 'chat' ? 'badge-plan' : 'badge-survey'}`}>
                    {item.phase === 'chat' ? '✅ Plan ready' : item.phase === 'generating' ? '⏳ Generating' : `📝 Step ${item.stepIdx}/${STEPS.length}`}
                  </span>
                </div>
                <div className="history-datetime">
                  <Clock className="w-2.5 h-2.5 shrink-0" />
                  <span>{smartDate(item.updatedAt)}</span>
                  {item.createdAt !== item.updatedAt && (
                    <span className="history-created-label">Created {smartDate(item.createdAt)}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="hawkai-main-content">

        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3.5 hawkai-chat-header border-b border-white/5 bg-[#1A1B1E]">
          <button onClick={() => setIsSidebarOpen(true)} className="icon-btn lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg hawkai-logo bg-gradient-to-br from-[#FF6B00] to-[#ea580c] flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-theme-main flex items-center gap-1.5">
                HawkAI Assistant
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse"></span>
              </h2>
              <p className="text-[10px] text-theme-muted font-medium tracking-wide uppercase">
                {phase === 'chat' ? `Session: ${sessionId.split('_')[1]}` : 'POWERED BY OLLAMA'}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={startNewChat} className="icon-btn hidden sm:flex" title="New Chat">
              <Plus className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="icon-btn">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Progress bar */}
        <div className="h-[3px] bg-white/5">
          <div
            className="h-full hawkai-progress-bar bg-gradient-to-r from-[#FF6B00] to-[#eab308]"
            style={{ width: phase === 'chat' ? '100%' : `${((stepIdx) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative scrollbar-hide"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 chat-bubble-animate ${msg.role === 'bot' ? 'self-start' : 'self-end flex-row-reverse'} ${msg.type === 'diet-plan' ? 'max-w-full' : 'max-w-[88%]'}`}
            >
              {msg.role === 'bot' && (
                <span className="w-8 h-8 rounded-full bg-[#1A1B1E] flex items-center justify-center text-base shrink-0">🦅</span>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed ${
                  msg.role === 'bot'
                    ? msg.type === 'diet-plan'
                      ? 'hawkai-diet-bubble bg-gradient-to-br from-[#111827]/95 to-[#1e293b]/95 border border-[#FF6B00]/20'
                      : 'hawkai-bot-bubble bg-[#1A1B1E] border border-white/10'
                    : 'hawkai-user-bubble bg-gradient-to-br from-[#FF6B00] to-[#ea580c] text-white'
                }`}
              >
                {msg.role === 'bot' ? (
                  <div className="markdown-body">
                    {msg.type === 'action-buttons' ? (
                      <div>
                        <p className="text-sm mb-3 text-white/80">{msg.text}</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold hover:bg-[#FF6B00] hover:border-[#FF6B00] transition-all"
                            onClick={startNewChat}
                          >🆕 New Plan</button>
                          <button
                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold hover:bg-[#FF6B00] hover:border-[#FF6B00] transition-all"
                            onClick={() => handleChatMessage('Modify my diet plan')}
                          >🔄 Modify Plan</button>
                          <button
                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold hover:bg-[#FF6B00] hover:border-[#FF6B00] transition-all"
                            onClick={() => handleChatMessage('Give me a grocery list for my diet plan')}
                          >🛒 Grocery List</button>
                        </div>
                      </div>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    )}
                  </div>
                ) : (
                  <p className="m-0 whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="typing-indicator flex gap-1 p-2 self-start">
              <span></span><span></span><span></span>
            </div>
          )}

          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-28 right-6 w-9 h-9 rounded-full bg-[#FF6B00] flex items-center justify-center shadow-lg z-10 animate-bounce"
            >
              <ChevronDown className="w-5 h-5 text-white" />
            </button>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Blood Form */}
        {phase === 'blood-form' && (
          <div className="px-4 py-4 bg-[#1A1B1E] border-t border-white/5">
            <p className="text-xs text-white/40 mb-2">Fill in what you have — leave blanks if unknown</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {BLOOD_FIELDS.map(f => (
                <input
                  key={f.key}
                  type="number"
                  placeholder={f.label}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-[#FF6B00] outline-none transition-all"
                  onChange={e => setBloodData({ ...bloodData, [f.key]: e.target.value })}
                />
              ))}
            </div>
            <button
              className="w-full py-2.5 rounded-full bg-[#FF6B00] text-sm font-bold text-white shadow-lg hover:bg-[#ea580c] transition-colors"
              onClick={() => generateDiet(userData, bloodData, messages)}
            >
              Submit Blood Report →
            </button>
          </div>
        )}

        {/* Input Area */}
        {(phase === 'survey' || phase === 'chat') && !loading && (
          <div className="px-4 py-3 bg-[#1A1B1E] border-t border-white/5">
            {phase === 'survey' && STEPS[stepIdx]?.type === 'options' ? (
              <div className="flex flex-wrap gap-2">
                {STEPS[stepIdx].options?.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-[#FF6B00] hover:border-[#FF6B00] transition-all option-animate"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <form
                className="flex gap-2"
                onSubmit={e => {
                  e.preventDefault()
                  if (phase === 'survey') handleAnswer(inputVal)
                  else handleChatMessage(inputVal)
                }}
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder={
                    phase === 'survey'
                      ? (STEPS[stepIdx]?.placeholder || 'Type your answer...')
                      : 'Ask HawkAI anything about your diet...'
                  }
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white outline-none focus:border-[#FF6B00] transition-all"
                />
                <button
                  type="submit"
                  className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#ea580c] flex items-center justify-center shadow-lg shadow-orange-500/20 text-white hover:scale-105 active:scale-95 transition-transform"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>,
    document.body
  )
}
