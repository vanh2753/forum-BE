const { Notification } = require('../models/index')

const getAllNotificationsForUser = async (req, res, next) => {
    try {
        const notifications = await Notification.findAll({
            where: { receiver_id: req.user.userId },
            order: [['createdAt', 'DESC']]
        })
        res.status(200).json({
            EC: 0,
            EM: "Lấy thông báo người dùng thành công",
            DT: notifications
        })
    } catch (error) {
        next(error)
    }
}

const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user?.userId || null;
        const notification = await Notification.findByPk(req.params.id)
        if (notification && notification.receiver_id === userId) {
            notification.is_read = true
            await notification.save()
            res.status(200).json({
                EC: 0,
                EM: "Thông báo này đã được đọc"
            })
        }
    } catch (error) {
        next(error)
    }
}

const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user?.userId || null;
        await Notification.update(
            { is_read: true },
            { where: { receiver_id: userId } }
        )
        res.status(200).json({
            EC: 0,
            EM: "Tất cả thông báo đã được đọc"
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllNotificationsForUser,
    markAsRead,
    markAllAsRead
}
