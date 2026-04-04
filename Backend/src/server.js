require('dotenv').config()
require('express-async-errors')

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')

const app = express()
const server = http.createServer(app)

const prisma = new PrismaClient()
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    methods: ['GET', 'POST'],
    credentials: true,
  }
})

app.use((req, res, next) => {
  req.io = io
  next()
})

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const authRoutes       = require('./routes/auth.routes')
const teacherRoutes    = require('./routes/teacher.routes')
const studentRoutes    = require('./routes/student.routes')
const attendanceRoutes = require('./routes/attendance.routes')
const gradeRoutes      = require('./routes/grade.routes')
const timetableRoutes  = require('./routes/timetable.routes')
const alertRoutes      = require('./routes/alert.routes')
const reportRoutes     = require('./routes/report.routes')
const adminRoutes      = require('./routes/admin.routes')

app.use('/api/auth',       authRoutes)
app.use('/api/teachers',   teacherRoutes)
app.use('/api/students',   studentRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/grades',     gradeRoutes)
app.use('/api/timetable',  timetableRoutes)
app.use('/api/alerts',     alertRoutes)
app.use('/api/reports',    reportRoutes)
app.use('/api/admin',      adminRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EduEase API is running' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EduEase API is running' })
})

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id)

  socket.on('join_teacher_room', (teacherId) => {
    socket.join(`teacher_${teacherId}`)
    console.log(`Teacher ${teacherId} joined their room`)
  })

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id)
  })
})

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message)

   if (err.code === 'P2002') {
    return res.status(400).json({ error: 'A record with this data already exists.' })
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' })
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token.' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired. Please log in again.' })
  }

  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong on the server.'
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`\n🚀 EduEase server running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
})

module.exports = { app, server, prisma, io }