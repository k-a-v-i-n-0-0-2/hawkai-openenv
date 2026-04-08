import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, Send, ArrowLeft, ChevronDown, Bot } from 'lucide-react'
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

export default function DietChat({ onClose }: DietChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('hawkai_messages')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) { console.error('Error parsing messages', e) }
    return [{ role: 'bot', text: STEPS[0].question }]
  })
  const [stepIdx, setStepIdx] = useState(() => {
    try {
      const saved = localStorage.getItem('hawkai_stepIdx')
      if (saved) {
        const idx = parseInt(saved, 10)
        if (!isNaN(idx)) return idx
      }
    } catch (e) { console.error('Error parsing stepIdx', e) }
    return 0
  })
  const [userData, setUserData] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('hawkai_userData')
      return saved ? JSON.parse(saved) : {}
    } catch (e) { return {} }
  })
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState<ChatPhase>(() => {
    const saved = localStorage.getItem('hawkai_phase')
    if (saved === 'survey' || saved === 'blood-form' || saved === 'generating' || saved === 'chat') {
       return saved as ChatPhase
    }
    return 'survey'
  })
  const [bloodData, setBloodData] = useState<Record<string, string>>({})
  const [storedDietPlan, setStoredDietPlan] = useState(() => localStorage.getItem('hawkai_dietPlan') || '')
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem('hawkai_sessionId');
    if (saved) return saved;
    const newId = `session_${Date.now()}`;
    localStorage.setItem('hawkai_sessionId', newId);
    return newId;
  })

  useEffect(() => {
    localStorage.setItem('hawkai_messages', JSON.stringify(messages))
    localStorage.setItem('hawkai_stepIdx', stepIdx.toString())
    localStorage.setItem('hawkai_userData', JSON.stringify(userData))
    localStorage.setItem('hawkai_phase', phase)
    
    if (storedDietPlan) {
      const valueToSave = typeof storedDietPlan === 'object' ? JSON.stringify(storedDietPlan) : storedDietPlan;
      localStorage.setItem('hawkai_dietPlan', valueToSave);
    }
  }, [messages, stepIdx, userData, phase, storedDietPlan])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const userNearBottom = useRef(true)

  // Check if user is near the bottom of the chat
  const checkIfNearBottom = useCallback(() => {
    const el = chatContainerRef.current
    if (!el) return true
    const threshold = 150 // px from bottom
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  }, [])

  // Handle scroll events to track user position
  const handleChatScroll = useCallback(() => {
    const near = checkIfNearBottom()
    userNearBottom.current = near
    setShowScrollBtn(!near)
  }, [checkIfNearBottom])

  // Smart scroll: only auto-scroll if user is already near bottom and NOT during diet-plan streaming
  useEffect(() => {
    if (phase === 'generating') return // Don't auto-scroll during generation
    if (userNearBottom.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else {
      setShowScrollBtn(true)
    }
  }, [messages, phase])

  // Scroll after user sends a message (always scroll for user messages)
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    userNearBottom.current = true
    setShowScrollBtn(false)
  }, [])

  const step = stepIdx < STEPS.length ? STEPS[stepIdx] : null

  /* ── Handle survey answers ── */
  function handleAnswer(answer: string) {
    if (loading) return
    const trimmed = answer.trim()
    if (!trimmed) return

    const newMessages: Message[] = [...messages, { role: 'user', text: trimmed }]
    setMessages(newMessages)
    scrollToBottom()
    const currentStep = STEPS[stepIdx]
    const newData = { ...userData, [currentStep.key]: trimmed === 'skip' ? 'Not provided' : trimmed }
    setUserData(newData)
    setInputVal('')

    const nextIdx = stepIdx + 1

    if (currentStep.key === 'blood_report') {
      if (trimmed.toLowerCase().includes('yes')) {
        newMessages.push({ role: 'bot', text: "🩸 Great! Please fill in the blood report values below. Leave blank any you don't have." })
        setMessages(newMessages)
        setPhase('blood-form')
        return
      } else {
        newMessages.push({ role: 'bot', text: "🧠 Perfect! Generating your personalized diet plan...\n\n⏳ Analyzing your metrics with precision." })
        setMessages(newMessages)
        setStepIdx(nextIdx)
        generateDiet(newData, null)
        return
      }
    }

    if (nextIdx < STEPS.length) {
      newMessages.push({ role: 'bot', text: STEPS[nextIdx].question })
      setMessages(newMessages)
      setStepIdx(nextIdx)

      // Trigger Topic Suggestions after Intermittent Fasting (key: 'fasting')
      if (currentStep.key === 'fasting') {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'bot',
            text: "💡 You can also explore these topics anytime:",
            type: 'action-buttons'
          }])
        }, 1000)
      }
    } else {
      newMessages.push({ role: 'bot', text: "🧠 Generating your personalized diet plan...\n\n⏳ Analyzing your metrics with precision." })
      setMessages(newMessages)
      generateDiet(newData, null)
    }
  }

  /* ── Submit blood report and generate ── */
  function handleBloodSubmit() {
    const filledValues: Record<string, string> = {}
    let hasValues = false
    for (const [k, v] of Object.entries(bloodData)) {
      if (v && v.trim()) {
        filledValues[k] = v.trim()
        hasValues = true
      }
    }

    const summaryParts = Object.entries(filledValues).map(([k, v]) => {
      const field = BLOOD_FIELDS.find(f => f.key === k)
      return `${field?.label || k}: ${v}`
    })

    const newMessages: Message[] = [...messages]
    if (hasValues) {
      newMessages.push({ role: 'user', text: `📋 Blood Report:\n${summaryParts.join('\n')}` })
    } else {
      newMessages.push({ role: 'user', text: 'Skipped blood report' })
    }
    newMessages.push({ role: 'bot', text: "🧠 Got it! Generating your diet plan with blood report analysis...\n\n⏳ Analyzing everything with precision." })
    setMessages(newMessages)
    setPhase('generating')
    generateDiet(userData, hasValues ? filledValues : null)
  }

  /* ── Generate diet plan ── */
  async function generateDiet(data: Record<string, string>, bloodReport: Record<string, string> | null) {
    setLoading(true)
    setPhase('generating')
    try {
      const payload: Record<string, unknown> = {
        ...data,
        session_id: sessionId,
      }
      if (bloodReport) {
        payload.blood_report = bloodReport
      }

      const res = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Server returned Status ${res.status}`);
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        setMessages(prev => [
          ...prev,
          { role: 'bot', text: '', type: 'diet-plan' }
        ])

        let lastUpdate = Date.now()
        while (true) {
          const { value, done } = await reader.read()
          if (done) break;
          const chunk = decoder.decode(value, { stream: true })
          fullText += chunk

          if (Date.now() - lastUpdate > 40) {
            setMessages(prev => {
              const updated = [...prev]
              const last = updated[updated.length - 1]
              if (last && last.type === 'diet-plan') {
                last.text = fullText
              }
              return updated
            })
            lastUpdate = Date.now()
          }
        }

        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last && last.type === 'diet-plan') {
            last.text = fullText
          }
          return updated
        })

        setStoredDietPlan(fullText)
        setMessages(prev => [
          ...prev,
          { role: 'bot', text: "✅ Your diet plan is ready! You can now:\n\n• 🔄 **Modify** — I'll generate a new variation\n• 💬 **Ask me** about diet, supplements, meals\n• 🩸 **Submit blood report** for analysis\n\nJust type your question below!" }
        ])
        setPhase('chat')
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: `❌ Error: ${err.message || err}\n\nMake sure the backend is running and connected.` },
      ])
      setPhase('chat')
    } finally {
      setLoading(false)
    }
  }

  /* ── Handle free chat messages ── */
  async function handleChatMessage(text: string) {
    if (!text.trim() || loading) return
    const trimmed = text.trim()
    setInputVal('')
    setMessages(prev => [...prev, { role: 'user', text: trimmed }])
    scrollToBottom()
    setLoading(true)

    // Handle modification keywords by triggering the backend modification logic or survey
    if (['modify', 'regenerate', 'new diet', 'change diet', 'modify diet'].some(k => trimmed.toLowerCase().includes(k))) {
      // For simplicity in this version, we redirect modification to the survey or a specific prompt
      // The backend /generate or /api/tracker/ai-chat can also handle this
    }

    try {
      const dateStr = format(new Date(), 'yyyy-MM-dd')
      const res = await fetch(`${API_BASE_URL}/api/tracker/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, date: dateStr }),
      })

      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`)
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        setMessages(prev => [...prev, { role: 'bot', text: '' }])

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim()
              if (dataStr === '[DONE]') continue
              try {
                const data = JSON.parse(dataStr)
                if (data.text) {
                  fullText += data.text
                  setMessages(prev => {
                    const updated = [...prev]
                    const last = updated[updated.length - 1]
                    if (last && last.role === 'bot') {
                      last.text = fullText
                    }
                    return updated
                  })
                }
              } catch (e) {
                console.error('Error parsing stream chunk:', e)
              }
            }
          }
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'bot', text: `❌ Error: ${err.message || 'Connection failed'}. Is the backend running?` }])
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col hawkai-chat-root bg-[#0a0a0a]">
      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-4 py-3.5 hawkai-chat-header bg-[#1A1B1E] border-b border-white/5">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-theme-main hover:bg-[#FF6B00] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg hawkai-logo bg-gradient-to-br from-[#FF6B00] to-[#ea580c] flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Bot className="w-5 h-5 text-theme-main hawkai-logo-icon" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-theme-main hawkai-header-title flex items-center gap-1.5">
              HawkAI Assistant
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse"></span>
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-theme-muted hawkai-header-subtitle font-medium tracking-wide uppercase">POWERED BY OLLAMA</p>
              {phase === 'survey' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-theme-muted font-bold">
                  STEP {stepIdx + 1}/{STEPS.length}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-theme-muted hover:text-theme-main hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* ── Progress ── */}
      <div className="h-[3px] bg-white/5">
        <div
          className="h-full hawkai-progress-bar bg-gradient-to-r from-[#FF6B00] to-[#eab308] rounded-sm transition-all duration-500"
          style={{ width: phase === 'chat' ? '100%' : `${((stepIdx) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* ── Messages ── */}
      <div ref={chatContainerRef} onScroll={handleChatScroll} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 chat-bubble-animate ${
              msg.role === 'bot' ? 'self-start' : 'self-end flex-row-reverse'
            } ${msg.type === 'diet-plan' ? 'max-w-[98%]' : 'max-w-[88%]'}`}
          >
            {msg.role === 'bot' && (
              <span className="w-8 h-8 rounded-full bg-[#1A1B1E] border border-white/10 flex items-center justify-center text-base shrink-0">
                🦅
              </span>
            )}
            <div
              className={`px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed overflow-x-auto ${
                msg.role === 'bot'
                  ? msg.type === 'diet-plan'
                    ? 'hawkai-diet-bubble bg-gradient-to-br from-[#111827]/95 to-[#1e293b]/95 border border-[#FF6B00]/20 text-theme-main rounded-bl-sm text-[13px] px-5 py-5'
                    : 'hawkai-bot-bubble bg-[#1A1B1E] border border-white/10 text-theme-main rounded-bl-sm'
                  : 'hawkai-user-bubble bg-gradient-to-br from-[#FF6B00] to-[#ea580c] text-theme-main rounded-br-sm'
              }`}
            >
              {msg.role === 'bot' ? (
                <div className={`markdown-body ${msg.type === 'diet-plan' ? 'diet-plan-content' : ''}`}>
                  {msg.type === 'action-buttons' ? (
                    <div className="flex flex-col gap-3">
                      <p className="m-0 text-[13px] opacity-90">{msg.text}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          className="px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-theme-main transition-all whitespace-nowrap"
                          onClick={() => {
                            if (window.confirm("Reset current diet plan and start a new survey?")) {
                              localStorage.removeItem('hawkai_messages')
                              localStorage.removeItem('hawkai_stepIdx')
                              localStorage.removeItem('hawkai_userData')
                              localStorage.removeItem('hawkai_phase')
                              localStorage.removeItem('hawkai_dietPlan')
                              localStorage.removeItem('hawkai_sessionId')
                              setMessages([{ role: 'bot', text: STEPS[0].question }])
                              setStepIdx(0)
                              setUserData({})
                              setPhase('survey')
                              setStoredDietPlan('')
                              setBloodData({})
                            }
                          }}
                        >🆕 New Diet</button>
                        <button className="px-3.5 py-1.5 rounded-full hawkai-action-btn-bubble border border-white/10 text-theme-main text-xs font-bold hover:bg-[#FF6B00] hover:border-[#FF6B00] transition-all whitespace-nowrap shadow-sm" onClick={() => handleChatMessage('Modify my diet plan')}>🔄 Modify Diet</button>
                        <button className="px-3.5 py-1.5 rounded-full hawkai-action-btn-bubble border border-white/10 text-theme-main text-xs font-bold hover:bg-[#FF6B00] hover:border-[#FF6B00] transition-all whitespace-nowrap shadow-sm" onClick={() => handleChatMessage('What supplements should I take?')}>💊 Supplements</button>
                        <button className="px-3.5 py-1.5 rounded-full hawkai-action-btn-bubble border border-white/10 text-theme-main text-xs font-bold hover:bg-[#FF6B00] hover:border-[#FF6B00] transition-all whitespace-nowrap shadow-sm" onClick={() => handleChatMessage('Give me healthy snack ideas')}>🍎 Snacks</button>
                        <button
                          className="px-3.5 py-1.5 rounded-full hawkai-action-btn-bubble border border-white/10 text-theme-main text-xs font-bold hover:bg-[#FF6B00] hover:border-[#FF6B00] transition-all whitespace-nowrap shadow-sm"
                          onClick={() => {
                            setMessages(prev => [...prev,
                              { role: 'bot', text: "🩸 Fill in your blood report values below:" }
                            ])
                            setPhase('blood-form')
                            setBloodData({})
                          }}
                        >🩸 Blood Report</button>
                      </div>
                    </div>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => (
                          <div className="table-wrapper">
                            <table>{children}</table>
                          </div>
                        )
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap break-words m-0">{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 self-start max-w-[88%] chat-bubble-animate">
            <span className="w-8 h-8 rounded-full bg-[#1A1B1E] border border-white/10 flex items-center justify-center text-base shrink-0">
              🦅
            </span>
            <div className="px-4 py-3 rounded-2xl bg-[#1A1B1E] border border-white/10 rounded-bl-sm">
              <div className="typing-indicator"><span /><span /><span /></div>
            </div>
          </div>
        )}

        {/* ── Quick Actions Sticky ── */}
        <div ref={chatEndRef} />

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-2 self-center w-10 h-10 rounded-full bg-[#FF6B00] text-theme-main flex items-center justify-center shadow-lg hover:scale-110 transition-all z-50"
            title="Scroll to bottom"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Blood Report Form ── */}
      {phase === 'blood-form' && (
        <div className="px-4 py-3 bg-[#1A1B1E] border-t border-white/5 max-h-[50vh] flex flex-col">
          <div className="blood-form-scroll">
            {BLOOD_FIELDS.map(f => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-theme-muted tracking-wide">{f.label}</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={f.placeholder}
                  value={bloodData[f.key] || ''}
                  onChange={e => setBloodData(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="px-2.5 py-2 rounded-lg border border-white/10 bg-white/5 text-theme-main text-[13px] outline-none focus:border-[#FF6B00] transition-colors placeholder:text-theme-muted placeholder:text-[11px]"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5 pt-2">
            <button
              className="w-full py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-theme-main text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all"
              onClick={handleBloodSubmit}
            >
              🩸 Submit & Generate Diet
            </button>
            <button
              className="w-full py-2.5 rounded-full border border-white/10 text-theme-muted text-xs hover:border-gray-400 hover:text-theme-main transition-all"
              onClick={() => {
                setMessages(prev => [
                  ...prev,
                  { role: 'user', text: 'Skipped blood report' },
                  { role: 'bot', text: "🧠 No problem! Generating your diet plan now..." },
                ])
                setPhase('generating')
                generateDiet(userData, null)
              }}
            >
              Skip → Generate without blood report
            </button>
          </div>
        </div>
      )}

      {/* ── Survey Input ── */}
      {phase === 'survey' && !loading && step && (
        <div className="px-4 py-2.5 hawkai-chat-footer bg-[#1A1B1E] border-t border-white/5">
          {step.type === 'options' && step.options ? (
            <div className="flex flex-wrap gap-2">
              {step.options.map((opt, i) => (
                <button
                  key={i}
                  className="option-animate hawkai-action-btn px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-theme-main text-[13px] font-medium hover:bg-[#FF6B00] hover:border-[#FF6B00] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition-all"
                  onClick={() => handleAnswer(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleAnswer(inputVal) }}>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={step.placeholder || 'Type here...'}
                className="flex-1 px-4 py-3 rounded-full border border-white/10 hawkai-chat-input bg-white/5 text-theme-main text-sm outline-none focus:border-[#FF6B00] transition-colors placeholder:text-theme-muted"
                autoFocus
              />
              <button
                type="submit"
                className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#ea580c] text-theme-main flex items-center justify-center shrink-0 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.3)] transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── Free Chat Input ── */}
      {phase === 'chat' && !loading && (
        <div className="px-4 py-2.5 hawkai-chat-footer bg-[#1A1B1E] border-t border-white/5">
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleChatMessage(inputVal) }}>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about diet, supplements, meals..."
              className="flex-1 px-4 py-3 rounded-full border border-white/10 hawkai-chat-input bg-white/5 text-theme-main text-sm outline-none focus:border-[#FF6B00] transition-colors placeholder:text-theme-muted"
              autoFocus
            />
            <button
              type="submit"
              className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#ea580c] text-theme-main flex items-center justify-center shrink-0 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.3)] transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>,
    document.body
  )
}
