const express = require('express')
const router  = express.Router()
const {
  getTimetable,
  updateTimetableSlot,
  generateTimetable,
  saveGeneratedTimetable,
} = require('../controllers/timetable.controller')
const { protect, requireRole } = require('../middleware/auth.middleware')

router.get('/',                protect, getTimetable)
router.put('/:id',             protect, requireRole('admin'), updateTimetableSlot)
router.post('/generate',       protect, generateTimetable)
router.post('/save-generated', protect, saveGeneratedTimetable)

module.exports = router