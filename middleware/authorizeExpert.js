const { Account } = require("../models/index")
const authorizeExpert = async (req, res, next) => {
    try {
        const user = await Account.findByPk(req.user.userId)
        if (user.isExpert) {
            next()
        }
        else {
            return res.status(401).json({
                EM: "Ban chưa được cấp quyền chuyên gia",
                EC: 1
            })
        }
    } catch (error) {
        next(error)
    }

};

module.exports = { authorizeExpert };
