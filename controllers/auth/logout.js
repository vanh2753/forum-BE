
const logout = (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    })

    return res.status(200).json({
        EM: 'Đăng xuất thành công',
        EC: 0
    })
}

module.exports = { logout }
