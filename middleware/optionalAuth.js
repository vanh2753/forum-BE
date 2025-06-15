const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const optionalAuth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return next();
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        next();
    }
};

module.exports = { optionalAuth };
