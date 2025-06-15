const express = require('express');
const router = express.Router();
const { createPaymentUrl, handleIPN, handleReturn } = require('../controllers/vnpay-controller');
const { authenticateToken } = require('../middleware/authenticateToken');

router.get('/vnpay/callback', handleIPN); // <-- IPN URL: VNPAY gọi đến
router.get('/vnpay/return', handleReturn); // <-- Return URL: user được redirect về
router.get('/vnpay/create-payment/:orderId', authenticateToken, createPaymentUrl);

module.exports = router;
