const jwt = require('jsonwebtoken')

const generateAccessToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.EXPIRE_TIME })
}

const generateRefreshToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_EXPIRE_TIME })
}

module.exports = { generateAccessToken, generateRefreshToken }
