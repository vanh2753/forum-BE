const crypto = require('crypto');
const qs = require('qs');
const moment = require('moment');
const { Order } = require('../models');

const tmnCode = process.env.VNP_TMNCODE;
const hashSecret = process.env.VNP_HASH_SECRET;
const returnUrl = process.env.VNP_RETURN_URL;
const vnpUrl = process.env.VNP_API_URL;

function sortObject(obj) {
    return Object.keys(obj).sort().reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
    }, {});
}

// ✅ Tạo URL thanh toán
const createPaymentUrl = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findByPk(orderId);
        if (!order || order.payment_status !== 'PENDING') {
            return res.status(400).json({ EC: 1, EM: 'Đơn hàng không hợp lệ' });
        }

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');

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
            vnp_IpAddr: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            vnp_CreateDate: createDate,
        };

        const sortedParams = sortObject(vnp_Params);
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', hashSecret);
        const signed = hmac.update(signData).digest('hex');

        sortedParams.vnp_SecureHash = signed;

        const paymentUrl = `${vnpUrl}?${qs.stringify(sortedParams, { encode: true })}`;
        res.json({ EC: 0, EM: 'Tạo URL thành công', DT: paymentUrl });
    } catch (error) {
        next(error);
    }
};

// ✅ Xử lý IPN (VNPAY gọi server, cập nhật trạng thái)
const handleIPN = async (req, res, next) => {
    console.log('👉 IPN Callback được gọi!');
    try {
        const vnp_Params = { ...req.query };
        const secureHash = vnp_Params.vnp_SecureHash;

        delete vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHashType;

        const sortedParams = sortObject(vnp_Params);
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', hashSecret);
        const signed = hmac.update(signData).digest('hex');

        console.log('👉 SignData:', signData);
        console.log('👉 Chữ ký tính:', signed);
        console.log('👉 Chữ ký từ VNPAY:', secureHash);

        if (secureHash !== signed) {
            return res.status(400).send('Invalid signature');
        }

        const orderId = vnp_Params.vnp_TxnRef;
        const rspCode = vnp_Params.vnp_ResponseCode;

        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).send('Không tìm thấy đơn hàng');

        if (rspCode === '00') {
            await order.update({ payment_status: 'PAID' });
            return res.status(200).send('Xác nhận thanh toán thành công');
        } else {
            await order.update({ payment_status: 'FAILED' });
            return res.status(200).send('Thanh toán thất bại');
        }
    } catch (error) {
        next(error);
    }
};

// ✅ Optional: xử lý returnUrl để hiển thị cảm ơn
const handleReturn = (req, res) => {
    res.send('Cảm ơn bạn đã thanh toán. Đang xử lý đơn hàng...');
};

module.exports = {
    createPaymentUrl,
    handleIPN,
    handleReturn,
};
