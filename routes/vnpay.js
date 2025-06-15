const express = require('express');
const router = express.Router();
const { createPaymentUrl, handleIPN, handleReturn } = require('../controllers/vnpay-controller');

router.get('/create-payment/:orderId', createPaymentUrl);
router.get('/callback', handleIPN); // <-- IPN URL: VNPAY gọi đến
router.get('/return', handleReturn); // <-- Return URL: user được redirect về

module.exports = router;
