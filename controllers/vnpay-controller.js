const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const qs = require('qs');
require('dotenv').config();
const { Order } = require('../models/index');
const moment = require('moment');

// Cấu hình từ .env
const tmnCode = process.env.VNP_TMNCODE;
const hashSecret = process.env.VNP_HASH_SECRET;
const returnUrl = process.env.VNP_RETURN_URL;
const vnpUrl = process.env.VNP_API_URL;

// Kiểm tra biến môi trường
if (!tmnCode || !hashSecret || !returnUrl || !vnpUrl) {
    console.error('Missing VNPay environment variables:', {
        tmnCode: !!tmnCode,
        hashSecret: !!hashSecret,
        returnUrl: !!returnUrl,
        vnpUrl: !!vnpUrl,
    });
    throw new Error('VNPay configuration is incomplete');
}

// Hàm sắp xếp keys theo thứ tự alphabet
function sortObject(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
            acc[key] = obj[key];
            return acc;
        }, {});
}

// Tạo URL thanh toán
async function createPaymentUrl(req, res, next) {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId);
        if (!order || order.payment_status !== 'PENDING') {
            return res.status(400).json({ EC: 1, EM: 'Đơn hàng không hợp lệ' });
        }

        const createDate = moment().format('YYYYMMDDHHmmss');
        // Rõ ràng sử dụng IPv4, tránh ::1
        const ipAddr = '127.0.0.1'; // Hardcode để đảm bảo IPv4

        // Đảm bảo total_price là số và nhân 100
        const amount = Math.round(Number(order.total_price) * 100).toString();
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ EC: 1, EM: 'Số tiền không hợp lệ' });
        }

        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: order.id.toString(),
            vnp_OrderInfo: `Thanh toan don hang #${order.id}`,
            vnp_OrderType: 'other',
            vnp_Amount: amount,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
        };

        const sortedParams = sortObject(vnp_Params);
        const signData = qs.stringify(sortedParams, { encode: false });
        const signed = crypto.createHmac('sha512', hashSecret).update(signData).digest('hex');
        sortedParams.vnp_SecureHash = signed;

        // Ghi log để debug
        console.log('createPaymentUrl - env:', { tmnCode, hashSecret, returnUrl, vnpUrl });
        console.log('createPaymentUrl - signData:', signData);
        console.log('createPaymentUrl - signed:', signed);
        console.log('createPaymentUrl - params:', sortedParams);

        const paymentUrl = `${vnpUrl}?${qs.stringify(sortedParams, { encode: true })}`;
        return res.json({ EC: 0, EM: 'Tạo URL thành công', DT: paymentUrl });
    } catch (err) {
        console.error('createPaymentUrl - error:', err);
        next(err);
    }
}

// Xử lý callback
async function handleCallback(req, res, next) {
    console.log('👉 Callback được gọi!');
    try {
        // Log toàn bộ request để debug
        console.log('👉 Raw query:', req.query);
        console.log('👉 Raw url:', req.originalUrl);

        const vnp_Params = { ...req.query };
        const secureHash = vnp_Params.vnp_SecureHash;

        if (!secureHash) {
            console.log('👉 Missing vnp_SecureHash in callback');
            return res.status(400).send('Thiếu chữ ký từ VNPay');
        }

        delete vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHashType;

        const sortedParams = sortObject(vnp_Params);
        const signData = qs.stringify(sortedParams, { encode: false });
        const signed = crypto.createHmac('sha512', hashSecret).update(signData).digest('hex');

        // Ghi log để debug
        console.log('👉 SignData:', signData);
        console.log('👉 Chữ ký tự tính:', signed);
        console.log('👉 Chữ ký từ VNPAY:', secureHash);
        console.log('👉 Sorted params:', sortedParams);

        if (secureHash !== signed) {
            console.log('👉 Chữ ký không khớp');
            return res.status(400).send('Chữ ký không hợp lệ');
        }

        const orderId = sortedParams.vnp_TxnRef;
        const rspCode = sortedParams.vnp_ResponseCode;
        const order = await Order.findByPk(orderId);
        if (!order) {
            console.log('👉 Không tìm thấy đơn hàng:', orderId);
            return res.status(404).send('Không tìm thấy đơn hàng');
        }

        if (rspCode === '00') {
            await order.update({ payment_status: 'PAID' });
            return res.send('Thanh toán thành công');
        } else {
            await order.update({ payment_status: 'FAILED' });
            return res.send('Thanh toán thất bại');
        }
    } catch (err) {
        console.error('handleCallback - error:', err);
        next(err);
    }
}

module.exports = { createPaymentUrl, handleCallback };