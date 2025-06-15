
const getUserByToken = async (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    return user
}

module.exports = { getUserByToken }
