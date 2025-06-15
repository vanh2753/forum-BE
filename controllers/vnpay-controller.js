const crypto = require('crypto');
const qs = require('qs');
require('dotenv').config();
const { Order } = require('../models/index');
const moment = require('moment');

// tham số cấu hình vnpay
const tmnCode = process.env.VNP_TMNCODE;
const hashSecret = process.env.VNP_HASH_SECRET;
const returnUrl = process.env.VNP_RETURN_URL;
const vnpUrl = process.env.VNP_API_URL;

function sortObject(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
            acc[key] = obj[key];
            return acc;
        }, {});
}

const createPaymentUrl = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findByPk(orderId);
        if (!order || order.payment_status !== 'PENDING') {
            return res.status(400).json({ EC: 1, EM: 'Đơn hàng không hợp lệ' });
        }

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: order.id,
            vnp_OrderInfo: `Thanh toan don hang #${order.id}`,
            vnp_OrderType: 'other',
            vnp_Amount: order.total_price * 100,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: '127.0.0.1',
            vnp_CreateDate: createDate
        };
        console.log(vnp_Params);
        const sortedParams = sortObject(vnp_Params); //sắp xếp lại tên các biến theo alphabet
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', hashSecret);
        const signed = hmac.update(signData).digest('hex');

        sortedParams.vnp_SecureHash = signed;

        const paymentUrl = `${vnpUrl}?${qs.stringify(sortedParams, { encode: true })}`;
        res.json({ EC: 0, EM: 'Tạo URL thành công', DT: paymentUrl });

    } catch (error) {
        next(error)
    }
}

const handleCallback = async (req, res, next) => {
    try {
        const vnp_Params = req.query;
        const secureHash = vnp_Params.vnp_SecureHash;

        delete vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHashType;

        const sortedParams = sortObject(vnp_Params);
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', hashSecret);
        const signed = hmac.update(signData).digest('hex');

        if (secureHash !== signed) {
            return res.status(400).send('Chữ ký không hợp lệ');
        }

        const orderId = vnp_Params.vnp_TxnRef;
        const rspCode = vnp_Params.vnp_ResponseCode;

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).send('Không tìm thấy đơn hàng');
        }

        if (rspCode === '00') {
            await order.update({ payment_status: 'PAID' });
            return res.send('Thanh toán thành công');
        } else {
            await order.update({ payment_status: 'FAILED' });
            return res.send('Thanh toán thất bại');
        }
    }
    catch (error) {
        next(error)
    }
}

module.exports = { createPaymentUrl, handleCallback }