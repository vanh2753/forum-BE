const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/authenticateToken')
const { createPost, getAllPosts, approvePostForMod, getAllApprovedPosts, getPostById, updatePost, deletePost, getPostsForHome, getPostsWithPagination, queryPost } = require('../controllers/post-controller')
const { upload } = require('../middleware/multer')
const { optionalAuth } = require('../middleware/optionalAuth')

router.post('/posts', authenticateToken, upload.array('image_urls', 5), createPost)
router.get('/posts', authenticateToken, getAllPosts)
router.get('/posts/approved', optionalAuth, getAllApprovedPosts)
router.get('/posts/search', queryPost);
// luôn để get /:params ở dưới /?query nếu không sẽ bị lỗi route
router.get('/posts/:id', optionalAuth, getPostById)
router.get('/posts/home/:topicId', optionalAuth, getPostsForHome)
router.get('/topics/:topicId/posts', optionalAuth, getPostsWithPagination);
router.patch('/posts/:id/approve', authenticateToken, approvePostForMod)
router.put('/posts/:id', authenticateToken, upload.array('image_files', 5), updatePost)
router.delete('/posts/:id', authenticateToken, deletePost)

module.exports = router
