const express = require('express')
const router = express.Router()
const { createLikeForPost, unlikeForPost, createLikeForComment, unlikeForComment } = require('../controllers/like-controller')
const { authenticateToken } = require('../middleware/authenticateToken')


router.post('/posts/:postId/like', authenticateToken, createLikeForPost)
router.delete('/posts/:postId/unlike', authenticateToken, unlikeForPost)
router.post('/comments/:commentId/like', authenticateToken, createLikeForComment)
router.delete('/comments/:commentId/unlike', authenticateToken, unlikeForComment)

module.exports = router
