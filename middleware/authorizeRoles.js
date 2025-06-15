
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) { // kiểm tra xem user có role trong mảng roles không
            return res.status(403).json({ EM: 'Bạn không có quyền hạn thực hiện thao tác nây' })
        }
        next()
    }
}

module.exports = { authorizeRoles }
