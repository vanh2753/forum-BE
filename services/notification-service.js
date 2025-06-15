const { Notification } = require('../models/index')

const createNotification = async ({ receiver_id, type, content, link }) => {
    try {
        const notification = await Notification.create({
            receiver_id,
            type,
            content,
            link
        })
        return notification
    }
    catch (error) {
        throw error
    }
}

module.exports = {
    createNotification
}