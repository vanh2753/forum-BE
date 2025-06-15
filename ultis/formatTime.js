const formatTime = (date) => {
    if (!date) return null;

    const dateObj = new Date(date);// luôn ép date thành kiểu object thì mới dùng được .getTime()
    const offset = 7 * 60 * 60 * 1000; // GMT+7
    const localTime = new Date(dateObj.getTime() + offset);

    return localTime.toISOString().replace('T', ' ').substring(0, 19); // "VD: 2025-04-20 13:45:00"
};

module.exports = { formatTime };
