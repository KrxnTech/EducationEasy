// TimetableGrid.jsx — Renders a weekly timetable as a grid
// Columns = days (Mon–Fri), Rows = periods

const DAYS    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const PERIODS = [1, 2, 3, 4, 5, 6]

// Colour per subject — consistent across the grid
const SUBJECT_COLORS = {
  'Mathematics': { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' },
  'Science':     { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  'English':     { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
  'History':     { bg: '#FFF7ED', text: '#92400E', border: '#FED7AA' },
  'Geography':   { bg: '#FDF2F8', text: '#9D174D', border: '#F9A8D4' },
}

const DEFAULT_COLOR = { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' }

export default function TimetableGrid({ timetable, onEditSlot, editable = false }) {
  // Build lookup: day → period → entry
  const grid = {}
  DAYS.forEach(day => {
    grid[day] = {}
    PERIODS.forEach(p => { grid[day][p] = null })
  })
  timetable.forEach(entry => {
    if (grid[entry.day]) {
      grid[entry.day][entry.period] = entry
    }
  })

  // Get time label for a period number
  const getTime = (period, field) => {
    const slot = timetable.find(e => e.period === period)
    return slot ? slot[field] : ''
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-160">
        <thead>
          <tr>
            {/* Period column header */}
            <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#FAFAFA] border border-[#E5E7EB] rounded-tl-xl">
              Period
            </th>
            {/* Day headers */}
            {DAYS.map((day, i) => (
              <th
                key={day}
                className={`px-4 py-3 text-center text-xs font-bold text-[#1A1A2E] uppercase tracking-wider bg-[#FAFAFA] border border-[#E5E7EB] ${
                  i === DAYS.length - 1 ? 'rounded-tr-xl' : ''
                }`}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 3)}</span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {PERIODS.map((period, rowIdx) => (
            <tr key={period}>
              {/* Period label + time */}
              <td className="px-3 py-2 border border-[#E5E7EB] bg-[#FAFAFA] text-center">
                <p className="text-xs font-bold text-[#1A1A2E]">P{period}</p>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                  {getTime(period, 'startTime')}
                </p>
                <p className="text-[10px] text-[#9CA3AF]">
                  {getTime(period, 'endTime')}
                </p>
              </td>

              {/* Subject cells for each day */}
              {DAYS.map(day => {
                const entry = grid[day][period]
                const color = entry
                  ? (SUBJECT_COLORS[entry.subject] || DEFAULT_COLOR)
                  : DEFAULT_COLOR

                return (
                  <td
                    key={`${day}-${period}`}
                    className="px-2 py-2 border border-[#E5E7EB]"
                  >
                    {entry ? (
                      <div
                        className={`rounded-xl px-3 py-2.5 text-center border transition-all duration-150 ${
                          editable ? 'cursor-pointer hover:opacity-80 hover:scale-95' : ''
                        }`}
                        style={{
                          backgroundColor: color.bg,
                          borderColor:     color.border,
                        }}
                        onClick={() => editable && onEditSlot && onEditSlot(entry)}
                      >
                        <p
                          className="text-xs font-bold leading-tight"
                          style={{ color: color.text }}
                        >
                          {entry.subject}
                        </p>
                        {entry.class?.name && (
                          <p className="text-[10px] mt-0.5 opacity-70" style={{ color: color.text }}>
                            {entry.class.name}
                          </p>
                        )}
                        {editable && (
                          <p className="text-[9px] mt-1 opacity-50" style={{ color: color.text }}>
                            click to edit
                          </p>
                        )}
                      </div>
                    ) : (
                      // Empty cell
                      <div className="rounded-xl px-3 py-2.5 text-center border border-dashed border-[#E5E7EB] bg-[#FAFAFA] min-h-13 flex items-center justify-center">
                        <span className="text-[10px] text-[#D1D5DB]">—</span>
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}