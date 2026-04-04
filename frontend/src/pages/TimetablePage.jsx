// TimetablePage.jsx — Fixed version
// Key fixes:
// 1. Classes loaded directly from /students endpoint grouped by class
// 2. Timetable fetched with explicit teacherId param
// 3. Generate works and shows preview correctly

import { useState, useEffect } from 'react'
import Layout         from '@/components/Layout'
import TimetableGrid  from '@/components/timetable/TimetableGrid'
import EditSlotModal  from '@/components/timetable/EditSlotModal'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage   from '@/components/ErrorMessage'
import { useAuth }    from '@/context/AuthContext'
import api            from '@/utils/api'
import {
  Calendar, Sparkles, Loader2, Save,
  CheckCircle, Info, RefreshCw, ChevronDown
} from 'lucide-react'

export default function TimetablePage() {
  const { user } = useAuth()

  // ── Data ────────────────────────────────────────────────
  const [classes,         setClasses]         = useState([])
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [timetable,       setTimetable]       = useState([])   // saved in DB
  const [generated,       setGenerated]       = useState([])   // AI preview
  const [showGenerated,   setShowGenerated]   = useState(false)

  // ── UI State ────────────────────────────────────────────
  const [loadingClasses,  setLoadingClasses]  = useState(true)
  const [loadingTable,    setLoadingTable]    = useState(false)
  const [generating,      setGenerating]      = useState(false)
  const [saving,          setSaving]          = useState(false)
  const [editingSlot,     setEditingSlot]     = useState(null)

  // ── Messages ────────────────────────────────────────────
  const [tableError,   setTableError]   = useState('')
  const [genError,     setGenError]     = useState('')
  const [saveError,    setSaveError]    = useState('')
  const [saveSuccess,  setSaveSuccess]  = useState('')

  // ── Step 1: Load teacher's classes on mount ──────────────
  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      setLoadingClasses(true)

      if (user?.role === 'admin') {
        // Admin: fetch all classes from admin endpoint
        const res = await api.get('/admin/classes')
        const cls = res.data.classes || []
        setClasses(cls)
        if (cls.length > 0) setSelectedClassId(cls[0].id)
      } else {
        // Teacher: fetch their own classes from dashboard
        const res = await api.get('/teachers/dashboard')
        const cls = res.data.classes || []
        setClasses(cls)
        if (cls.length > 0) setSelectedClassId(cls[0].id)
      }
    } catch (err) {
      console.error('Failed to load classes:', err)
      setTableError('Could not load classes: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoadingClasses(false)
    }
  }

  // ── Step 2: Load timetable when class is selected ────────
  useEffect(() => {
    if (selectedClassId) {
      loadTimetable(selectedClassId)
    }
  }, [selectedClassId])

  const loadTimetable = async (classId) => {
    try {
      setLoadingTable(true)
      setTableError('')
      setShowGenerated(false)
      setGenerated([])

      // For admin: fetch timetable by classId using teacherId from the class
      // For teacher: fetch by their own teacherId
      let params = {}

      if (user?.role === 'admin') {
        // Find the teacherId for this class
        const cls = classes.find(c => c.id === classId)
        if (cls?.teacherId) {
          params = { teacherId: cls.teacherId }
        }
      } else {
        params = { teacherId: user.id }
      }

      const res = await api.get('/timetable', { params })
      const all = res.data.timetable || []

      // Filter for selected class
      const filtered = all.filter(t => t.classId === classId)
      setTimetable(filtered)

    } catch (err) {
      setTableError('Failed to load timetable. ' + (err.response?.data?.error || ''))
    } finally {
      setLoadingTable(false)
    }
  }

  // ── Step 3: Generate timetable with AI ───────────────────
  const handleGenerate = async () => {
    if (!selectedClassId) {
      setGenError('Please select a class first.')
      return
    }

    try {
      setGenerating(true)
      setGenError('')
      setSaveSuccess('')
      setShowGenerated(false)

      const res = await api.post('/timetable/generate', {
        classId: selectedClassId
      })

      const entries = res.data.timetable || []
      if (entries.length === 0) {
        setGenError('AI returned an empty timetable. Please try again.')
        return
      }

      setGenerated(entries)
      setShowGenerated(true)

    } catch (err) {
      console.error('Generation error:', err)
      setGenError(
        err.response?.data?.error ||
        'Generation failed. Check your GROQ_API_KEY in backend/.env'
      )
    } finally {
      setGenerating(false)
    }
  }

  // ── Step 4: Edit a slot in the preview ───────────────────
  const handleEditSlot = (slot) => {
    setEditingSlot(slot)
  }

  const handleSaveEdit = (updatedSlot) => {
    setGenerated(prev =>
      prev.map(e =>
        e.day === updatedSlot.day &&
        e.period === updatedSlot.period &&
        e.classId === updatedSlot.classId
          ? { ...e, subject: updatedSlot.subject }
          : e
      )
    )
    setEditingSlot(null)
  }

  // ── Step 5: Save generated timetable to DB ───────────────
  const handleSave = async () => {
    try {
      setSaving(true)
      setSaveError('')
      setSaveSuccess('')

      const res = await api.post('/timetable/save-generated', {
        entries: generated
      })

      setSaveSuccess(`Timetable saved! ${res.data.count} slots stored.`)
      setShowGenerated(false)
      setGenerated([])

      // Reload from DB to show saved version
      await loadTimetable(selectedClassId)

      setTimeout(() => setSaveSuccess(''), 4000)

    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save timetable.')
    } finally {
      setSaving(false)
    }
  }

  // Which data to show in the grid
  const displayData   = showGenerated ? generated : timetable
  const selectedClass = classes.find(c => c.id === selectedClassId)

  return (
    <Layout>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-[#EDE9FE] rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">Timetable</h1>
          </div>
          <p className="text-[#6B7280] text-sm ml-12">
            View your class schedule or generate one using AI
          </p>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !selectedClassId}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] hover:bg-[#5B21B6] disabled:bg-[#C4B5FD] disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm shadow-purple-200"
        >
          {generating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            : <><Sparkles className="w-4 h-4" /> Generate Timetable (AI)</>
          }
        </button>
      </div>

      {/* ── Class selector ─────────────────────────────────── */}
      {loadingClasses ? (
        <p className="text-sm text-[#6B7280] mb-4">Loading classes...</p>
      ) : classes.length > 0 ? (
        <div className="flex items-center gap-3 mb-5">
          <label className="text-sm font-semibold text-[#6B7280] shrink-0">
            Class:
          </label>
          <div className="relative w-48">
            <select
              value={selectedClassId || ''}
              onChange={e => setSelectedClassId(Number(e.target.value))}
              className="w-full appearance-none bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-medium text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] pr-8 cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
          </div>

          {/* Show current state for debugging */}
          <span className="text-xs text-[#9CA3AF]">
            {timetable.length} slots loaded · {displayData.length} showing
          </span>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-700">No classes found. Make sure you are logged in as a teacher.</p>
        </div>
      )}

      {/* ── Error messages ─────────────────────────────────── */}
      {genError   && <div className="mb-4"><ErrorMessage message={genError}   /></div>}
      {tableError && <div className="mb-4"><ErrorMessage message={tableError} /></div>}
      {saveError  && <div className="mb-4"><ErrorMessage message={saveError}  /></div>}

      {/* ── AI Preview Banner ──────────────────────────────── */}
      {showGenerated && generated.length > 0 && (
        <div className="mb-4 p-4 bg-[#F5F3FF] border-2 border-[#7C3AED] rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#1A1A2E]">
                  ✨ AI Generated — {generated.length} slots for {selectedClass?.name}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Click any coloured cell to change the subject. Save when ready.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowGenerated(false); setGenerated([]) }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#6B7280] bg-white border border-[#E5E7EB] rounded-xl hover:bg-[#F3F4F6] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#5B21B6] disabled:bg-[#C4B5FD] rounded-xl transition-colors"
              >
                {saving
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                  : <><Save className="w-3.5 h-3.5" /> Save to Database</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Save success ───────────────────────────────────── */}
      {saveSuccess && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">{saveSuccess}</p>
        </div>
      )}

      {/* ── Main timetable card ────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="font-display font-bold text-base text-[#1A1A2E]">
              {showGenerated
                ? `✨ Preview — ${selectedClass?.name}`
                : `${selectedClass?.name || 'Weekly Schedule'}`}
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Monday – Friday · 6 periods per day
            </p>
          </div>

          {/* Legend */}
          <div className="hidden md:flex flex-wrap gap-3">
            {[
              ['Mathematics', '#5B21B6'],
              ['Science',     '#065F46'],
              ['English',     '#1E40AF'],
              ['History',     '#92400E'],
              ['Geography',   '#9D174D'],
            ].map(([subj, color]) => (
              <div key={subj} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color + '30', border: `1.5px solid ${color}` }} />
                <span className="text-[10px] text-[#6B7280]">{subj}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4">
          {loadingTable ? (
            <LoadingSpinner text="Loading timetable..." />
          ) : displayData.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-16 h-16 bg-[#F5F3FF] rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-[#C4B5FD]" />
              </div>
              <p className="font-semibold text-[#1A1A2E] mb-2">No timetable found</p>
              <p className="text-sm text-[#6B7280] max-w-xs leading-relaxed">
                Click <strong className="text-[#7C3AED]">"Generate Timetable (AI)"</strong> to
                automatically create a balanced weekly schedule.
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] text-white text-sm font-semibold rounded-xl hover:bg-[#5B21B6] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Generate Now
              </button>
            </div>
          ) : (
            <TimetableGrid
              timetable={displayData}
              onEditSlot={handleEditSlot}
              editable={showGenerated}
            />
          )}
        </div>
      </div>

      {/* ── Info note ──────────────────────────────────────── */}
      <div className="mt-4 p-4 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl flex items-start gap-3">
        <Info className="w-4 h-4 text-[#9CA3AF] mt-0.5 shrink-0" />
        <p className="text-xs text-[#6B7280] leading-relaxed">
          <strong className="text-[#1A1A2E]">How it works:</strong> AI generates a balanced timetable
          using Groq (Llama 3.3). If AI is unavailable, a smart round-robin algorithm runs automatically.
          Generated timetables are previews — you must click <strong>Save to Database</strong> to apply them.
        </p>
      </div>

      {/* Edit slot modal */}
      {editingSlot && (
        <EditSlotModal
          slot={editingSlot}
          onSave={handleSaveEdit}
          onClose={() => setEditingSlot(null)}
        />
      )}

    </Layout>
  )
}