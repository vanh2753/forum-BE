const express = require('express');
const router = express.Router();
const { createTopic, getTopicsForPreviewSection, getTopicsList } = require('../controllers/topic-controller')

router.post('/topics', createTopic)
router.get('/topics/preview-section', getTopicsForPreviewSection)
router.get('/topics', getTopicsList)

module.exports = router;
