const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/authenticateToken')
const { optionalAuth } = require('../middleware/optionalAuth')
const { createComment, updateComment, deleteComment, getCommentsForPost } = require('../controllers/comment-controller')

router.post('/posts/:post_id/comments', authenticateToken, createComment);
//router.get('/posts/:post_id/all-comments', optionalAuth, getAllCommentsForPost);
router.get('/posts/:post_id/comments', optionalAuth, getCommentsForPost);
router.put('/comments/:id', authenticateToken, updateComment);
router.delete('/comments/:id', authenticateToken, deleteComment);


module.exports = router
