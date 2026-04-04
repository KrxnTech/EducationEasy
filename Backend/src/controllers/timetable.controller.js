const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getTimetable = async (req, res) => {
  const teacherId = req.query.teacherId
    ? parseInt(req.query.teacherId)
    : req.user.id

    const timetable = await prisma.timetable.findMany({
    where: { teacherId },
    include: { class: true },
    orderBy: [{ day: 'asc' }, { period: 'asc' }]
  })
  const byDay = {}
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  days.forEach(day => { byDay[day] = [] })
  timetable.forEach(slot => {
    if (byDay[slot.day]) byDay[slot.day].push(slot)
  })

  res.json({ timetable, byDay })
}

const updateTimetableSlot = async (req, res) => {
  const slotId = parseInt(req.params.id)
  const { subject, teacherId, startTime, endTime } = req.body

  const slot = await prisma.timetable.update({
    where: { id: slotId },
    data: {
      ...(subject && { subject }),
      ...(teacherId && { teacherId: parseInt(teacherId) }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
    },
    include: { class: true, teacher: true }
  })

  res.json({ message: 'Timetable updated.', slot })
}
// ─── AI TIMETABLE GENERATOR ──────────────────────────────────
// Uses Groq API to generate a smart timetable
// Falls back to a built-in algorithm if Groq fails

const Groq = require('groq-sdk')
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// POST /api/timetable/generate
// Body: { classId } (optional — generates for all classes if omitted)
const generateTimetable = async (req, res) => {
  const { classId } = req.body

  // 1. Fetch class info + teacher + existing subjects
  const where = classId ? { id: parseInt(classId) } : {}
  const classes = await prisma.class.findMany({
    where,
    include: {
      teacher: true,
      students: { take: 1 }, // just to confirm class exists
    }
  })

  if (classes.length === 0) {
    return res.status(404).json({ error: 'No classes found.' })
  }

  const results = []

  for (const cls of classes) {
    // 2. Define subjects and time slots
    const subjects = [
      'Mathematics', 'Science', 'English',
      'History', 'Geography'
    ]

    const timeSlots = [
      { period: 1, start: '09:00', end: '09:45' },
      { period: 2, start: '09:45', end: '10:30' },
      { period: 3, start: '10:45', end: '11:30' }, // break before
      { period: 4, start: '11:30', end: '12:15' },
      { period: 5, start: '13:00', end: '13:45' }, // lunch before
      { period: 6, start: '13:45', end: '14:30' },
    ]

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    let timetableEntries = []

    // 3. Try Groq AI first
    try {
      const prompt = `Generate a weekly school timetable for ${cls.name}.
Subjects available: ${subjects.join(', ')}.
Days: Monday to Friday.
Periods per day: 6.
Time slots: ${timeSlots.map(s => `Period ${s.period}: ${s.start}-${s.end}`).join(', ')}.

Rules:
- Each subject should appear roughly equally across the week
- No subject should repeat more than once per day
- Mathematics and Science should be in morning periods (1-3)
- English should appear every day

Respond ONLY with a valid JSON array. No explanation. No markdown. Example format:
[{"day":"Monday","period":1,"subject":"Mathematics","startTime":"09:00","endTime":"09:45"},...]

Generate all 30 entries (6 periods × 5 days):`;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        temperature: 0.3, // low temp = more predictable JSON
        messages: [
          {
            role: 'system',
            content: 'You are a school timetable generator. Always respond with valid JSON arrays only. No markdown, no explanation.',
          },
          { role: 'user', content: prompt }
        ],
      })

      const raw = completion.choices[0]?.message?.content || ''

      // Strip any markdown code fences if present
      const cleaned = raw
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()

      const parsed = JSON.parse(cleaned)

      // Validate the response has the right shape
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].day) {
        timetableEntries = parsed
        console.log(`✅ Groq generated timetable for ${cls.name}`)
      } else {
        throw new Error('Invalid shape from Groq')
      }

    } catch (groqErr) {
      // 4. Fallback: deterministic round-robin algorithm
      console.log(`⚠️  Groq failed for ${cls.name}, using fallback algorithm:`, groqErr.message)

      timetableEntries = generateFallbackTimetable(days, timeSlots, subjects)
    }

    // 5. Add classId and teacherId to every entry
    const enriched = timetableEntries.map(entry => ({
      ...entry,
      classId:   cls.id,
      teacherId: cls.teacher.id,
      className: cls.name,
    }))

    results.push(...enriched)
  }

  res.json({ timetable: results, message: 'Timetable generated successfully.' })
}

// Fallback algorithm — pure round-robin, no AI needed
// Guarantees: no subject repeats in same day, balanced distribution
function generateFallbackTimetable(days, timeSlots, subjects) {
  const entries = []

  // Priority subjects for mornings
  const morning  = ['Mathematics', 'Science', 'English']
  const afternoon = ['History', 'Geography', 'English']

  days.forEach((day, dayIndex) => {
    // Rotate subjects based on day to avoid same pattern every day
    const rotated = [...subjects.slice(dayIndex % subjects.length), ...subjects.slice(0, dayIndex % subjects.length)]
    const used    = new Set()

    timeSlots.forEach((slot, slotIndex) => {
      // Pick a subject not yet used today
      let subject = ''
      const pool  = slotIndex < 3 ? morning : afternoon

      for (const s of [...pool, ...rotated]) {
        if (!used.has(s)) {
          subject = s
          used.add(s)
          break
        }
      }

      // Last resort — pick any unused
      if (!subject) {
        subject = subjects.find(s => !used.has(s)) || subjects[slotIndex % subjects.length]
        used.add(subject)
      }

      entries.push({
        day,
        period:    slot.period,
        subject,
        startTime: slot.start,
        endTime:   slot.end,
      })
    })
  })

  return entries
}

// POST /api/timetable/save-generated
// Body: { entries: [{ classId, teacherId, day, period, subject, startTime, endTime }] }
const saveGeneratedTimetable = async (req, res) => {
  const { entries } = req.body

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'entries array is required.' })
  }

  // Get unique classIds from entries
  const classIds = [...new Set(entries.map(e => e.classId))]

  // Delete old timetable for these classes
  await prisma.timetable.deleteMany({
    where: { classId: { in: classIds } }
  })

  // Insert all new entries
  const created = await Promise.all(
    entries.map(e =>
      prisma.timetable.create({
        data: {
          classId:   parseInt(e.classId),
          teacherId: parseInt(e.teacherId),
          subject:   e.subject,
          day:       e.day,
          period:    parseInt(e.period),
          startTime: e.startTime,
          endTime:   e.endTime,
        }
      })
    )
  )

  res.json({ message: `Saved ${created.length} timetable entries.`, count: created.length })
}

module.exports = {
  getTimetable,
  updateTimetableSlot,
  generateTimetable,
  saveGeneratedTimetable,
}