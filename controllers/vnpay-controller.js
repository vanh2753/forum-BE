const crypto = require('crypto');
const qs = require('qs');
const moment = require('moment');
const { Order } = require('../models');

const tmnCode = process.env.VNP_TMNCODE;
const hashSecret = process.env.VNP_HASH_SECRET;
const returnUrl = process.env.VNP_RETURN_URL;
const vnpUrl = process.env.VNP_API_URL;
const ipnUrl = process.env.VNP_IPN_URL;

function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}




// ✅ Tạo URL thanh toán
const createPaymentUrl = async (req, res, next) => {
    try {
        console.log("👉 Nhận yêu cầu tạo URL thanh toán cho order:", req.params.orderId);

        const orderId = req.params.orderId;
        const order = await Order.findByPk(orderId);

        if (!order || order.payment_status !== 'PENDING') {
            console.log("❌ Đơn hàng không hợp lệ hoặc đã thanh toán rồi.");
            return res.status(400).json({ EC: 1, EM: 'Đơn hàng không hợp lệ hoặc đã thanh toán.' });
        }

        // Các bước tạo URL...
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');

        let ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
        if (ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1") ipAddr = "127.0.0.1";

        let vnp_Params = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: tmnCode,
            vnp_Amount: 10000 * 100,
            vnp_CurrCode: "VND",
            vnp_TxnRef: orderId,
            vnp_OrderInfo: `Thanh toan don hang #${orderId}`,
            vnp_OrderType: "other", // hoặc 'billpayment', 'topup', v.v.
            vnp_Locale: "vn",
            vnp_ReturnUrl: returnUrl,
            vnp_IpnUrl: ipnUrl,
            vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
            vnp_IpAddr: ipAddr
        };

        delete vnp_Params['vnp_SecureHash'];

        const sortedParams = sortObject(vnp_Params);
        const signData = qs.stringify(sortedParams, { encode: false }); // chuẩn demo
        const hmac = crypto.createHmac('sha512', hashSecret);
        const signed = hmac.update(signData).digest('hex');

        const signedParams = {
            ...sortedParams,
            vnp_SecureHash: signed,
        };

        console.log("Sorted params trước khi ký:", sortedParams);
        console.log("Dữ liệu để ký:", signData);
        console.log("Chữ ký tạo ra:", signed);


        const paymentUrl = `${vnpUrl}?${qs.stringify(signedParams, { encode: true })}`;

        return res.json({
            EC: 0,
            EM: 'Tạo URL thành công',
            DT: paymentUrl
        });

    } catch (error) {
        console.error("❌ Lỗi tạo URL thanh toán:", error);
        next(error);
    }
};


// ✅ Xử lý IPN (VNPAY gọi server, cập nhật trạng thái)
const handleIPN = async (req, res, next) => {
    console.log('👉 IPN Callback được gọi!');
    console.log("👉 Full URL Callback:", req.url);

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
