const { Like } = require('../models/index')

const createLikeForPost = async (req, res, next) => {
    try {
        const { postId } = req.params
        const userId = req.user?.userId

        if (!userId) {
            return res.status(401).json({
                EC: 1,
                EM: 'Bạn cần đăng nhập để thực hiện thao tác này !'
            })
        }

        const like = await Like.create({
            post_id: postId,
            user_id: userId
        })
        res.status(201).json({
            EC: 0,
            EM: 'Like bài viết thành công',

        })
    } catch (error) {
        next(error)
    }
}

const unlikeForPost = async (req, res, next) => {
    try {
        const { postId } = req.params
        const userId = req.user?.userId

        if (!userId) {
            return res.status(401).json({
                EC: 1,
                EM: 'Bạn cần đăng nhập để thực hiện thao tác này !'
            })
        }

        const like = await Like.destroy({
            where: { post_id: postId, user_id: userId }
        })
        res.status(200).json({
            EC: 0,
            EM: 'Unlike bài viết',

        })
    } catch (error) {
        next(error)
    }
}

const createLikeForComment = async (req, res, next) => {
    try {
        const { commentId } = req.params
        const userId = req.user?.userId

        if (!userId) {
            return res.status(401).json({
                EC: 1,
                EM: 'Bạn cần đăng nhập để thực hiện thao tác này !'
            })
        }

        const like = await Like.create({
            comment_id: commentId,
            user_id: userId
        })
        res.status(201).json({
            EC: 0,
            EM: 'Like bình luận thành công',

        })
    } catch (error) {
        next(error)
    }
}

const unlikeForComment = async (req, res, next) => {
    try {
        const { commentId } = req.params
        const userId = req.user?.userId || null

        const like = await Like.destroy({
            where: { comment_id: commentId, user_id: userId }
        })
        res.status(200).json({
            EC: 0,
            EM: 'Unlike bình luận',

        })
    } catch (error) {
        next(error)
    }
}

module.exports = { createLikeForPost, unlikeForPost, createLikeForComment, unlikeForComment }
