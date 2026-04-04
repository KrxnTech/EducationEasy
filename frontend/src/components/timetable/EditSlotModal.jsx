// EditSlotModal.jsx — Simple modal to change a subject in a timetable slot

import { X, Check } from 'lucide-react'

const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography']

export default function EditSlotModal({ slot, onSave, onClose }) {
  if (!slot) return null

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal box */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-lg text-[#1A1A2E]">Edit Slot</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {slot.day} · Period {slot.period} · {slot.startTime}–{slot.endTime}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subject options */}
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
          Choose Subject
        </p>
        <div className="space-y-2">
          {SUBJECTS.map(subject => (
            <button
              key={subject}
              onClick={() => onSave({ ...slot, subject })}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 ${
                slot.subject === subject
                  ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                  : 'bg-[#F9FAFB] text-[#374151] border-[#E5E7EB] hover:border-[#7C3AED] hover:bg-[#F5F3FF]'
              }`}
            >
              {subject}
              {slot.subject === subject && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 text-sm font-medium text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}