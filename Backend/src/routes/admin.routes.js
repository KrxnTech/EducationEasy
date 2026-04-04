const express = require('express')
const router  = express.Router()
const {
  getAdminDashboard,
  getAllTeachers,
  getAllClasses,
} = require('../controllers/admin.controller')
const { protect, requireRole } = require('../middleware/auth.middleware')

router.get('/dashboard', protect, requireRole('admin'), getAdminDashboard)
router.get('/teachers',  protect, requireRole('admin'), getAllTeachers)
router.get('/classes',   protect, requireRole('admin'), getAllClasses)

module.exports = router