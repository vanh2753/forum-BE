const express = require('express');
const router = express.Router();
const { createPaymentUrl, handleCallback } = require('../controllers/vnpay-controller')
const { authenticateToken } = require('../middleware/authenticateToken')

router.post('/vnpay/create-payment-url/:orderId', authenticateToken, createPaymentUrl);
router.get('/vnpay/callback', handleCallback);

module.exports = router;