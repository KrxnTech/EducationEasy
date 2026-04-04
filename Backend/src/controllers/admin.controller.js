const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getAdminDashboard = async (req, res) => {
  const [
    totalTeachers,
    totalStudents,
    totalClasses,
    unreadAlerts,
    recentAlerts,
  ] = await Promise.all([
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.class.count(),
    prisma.alert.count({ where: { isRead: false } }),
    prisma.alert.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { student: { include: { class: true } } }
    }),
  ])

  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const allAttendance = await prisma.attendance.findMany({
    where: { date: { gte: twoWeeksAgo } }
  })
  const presentCount = allAttendance.filter(a => a.status === 'present').length
  const schoolAttendanceRate = allAttendance.length > 0
    ? Math.round((presentCount / allAttendance.length) * 100)
    : 0

  const classes = await prisma.class.findMany({
    include: {
      teacher: { select: { name: true, subject: true } },
      students: { include: { grades: true, attendance: true } }
    }
  })

  const classStats = classes.map(cls => {
    const studentCount = cls.students.length
    const allGrades = cls.students.flatMap(s => s.grades)
    const avgGrade = allGrades.length > 0
      ? Math.round(allGrades.reduce((sum, g) => sum + (g.marks / g.maxMarks) * 100, 0) / allGrades.length)
      : 0
    const allAtt = cls.students.flatMap(s => s.attendance)
    const attRate = allAtt.length > 0
      ? Math.round(allAtt.filter(a => a.status === 'present').length / allAtt.length * 100)
      : 0
    return {
      id: cls.id,
      name: cls.name,
      teacher: cls.teacher.name,
      subject: cls.teacher.subject,
      studentCount,
      avgGrade,
      attendanceRate: attRate,
    }
  })

  const teachers = await prisma.teacher.findMany({
    select: { id: true, name: true, subject: true, email: true },
    orderBy: { name: 'asc' }
  })

  const teacherWorkloads = await Promise.all(
    teachers.map(async t => {
      const classCount = await prisma.class.count({ where: { teacherId: t.id } })
      const studentCount = await prisma.student.count({
        where: { class: { teacherId: t.id } }
      })
      const periodCount = await prisma.timetable.count({ where: { teacherId: t.id } })
      return { ...t, classCount, studentCount, periodCount }
    })
  )

  res.json({
    stats: { totalTeachers, totalStudents, totalClasses, unreadAlerts, schoolAttendanceRate },
    recentAlerts,
    classStats,
    teacherWorkloads,
  })
}
// GET /api/admin/teachers — all teachers with their class + workload info
const getAllTeachers = async (req, res) => {
  const teachers = await prisma.teacher.findMany({
    select: {
      id:        true,
      name:      true,
      email:     true,
      subject:   true,
      createdAt: true,
      classes: {
        include: {
          students: { select: { id: true } } // just count, no data leak
        }
      },
      timetable: { select: { id: true } }    // just count
    },
    orderBy: { name: 'asc' }
  })

  const result = teachers.map(t => ({
    id:           t.id,
    name:         t.name,
    email:        t.email,
    subject:      t.subject,
    createdAt:    t.createdAt,
    classCount:   t.classes.length,
    studentCount: t.classes.reduce((sum, c) => sum + c.students.length, 0),
    periodCount:  t.timetable.length,
    classes:      t.classes.map(c => ({
      id:           c.id,
      name:         c.name,
      studentCount: c.students.length
    }))
  }))

  res.json({ teachers: result })
}
// GET /api/admin/classes — all classes with teacher info (admin only)
const getAllClasses = async (req, res) => {
  const classes = await prisma.class.findMany({
    include: {
      teacher:  { select: { id: true, name: true, subject: true } },
      students: { select: { id: true } },
    },
    orderBy: { name: 'asc' }
  })

  const result = classes.map(c => ({
    id:           c.id,
    name:         c.name,
    grade:        c.grade,
    section:      c.section,
    teacherId:    c.teacher.id,
    teacherName:  c.teacher.name,
    subject:      c.teacher.subject,
    studentCount: c.students.length,
  }))

  res.json({ classes: result })
}

module.exports = { getAdminDashboard, getAllTeachers, getAllClasses }