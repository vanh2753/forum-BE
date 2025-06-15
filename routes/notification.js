const express = require('express')
const router = express.Router()
const { markAsRead, markAllAsRead, getAllNotificationsForUser } = require('../controllers/notification-controller')
const { authenticateToken } = require('../middleware/authenticateToken')


router.get('/notifications', authenticateToken, getAllNotificationsForUser)
router.patch('/notifications/:id/read', authenticateToken, markAsRead)
router.patch('/notifications/read-all', authenticateToken, markAllAsRead)

module.exports = router
