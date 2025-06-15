const express = require('express');
const router = express.Router();
const { getUser, createModAccount, assignExpertRole, getAllUser, getUserByEmail, getModList } = require('../controllers/user-controller')
const { upload } = require('../middleware/multer');
const { authenticateToken } = require('../middleware/authenticateToken');
const { authorizeRoles } = require('../middleware/authorizeRoles');

router.get('/user', getAllUser)
router.post('/user/create-mod', authenticateToken, authorizeRoles('admin'), createModAccount)
router.put('/user/:id/assign-expert', authenticateToken, authorizeRoles('mod'), assignExpertRole)
router.post('/user/find-by-email', authenticateToken, getUserByEmail)
router.get('/user/get-mod-list', authenticateToken, authorizeRoles('admin'), getModList)


module.exports = router;
