const { Comment } = require('../models/index')
const { formatTime } = require('../ultis/formatTime')
const { Account, Post } = require('../models/index')
const { Op } = require('sequelize')
const { checkOwner } = require('../ultis/check-owner')
const { likeCountForComment } = require('../ultis/count')
const { createNotification } = require('../services/notification-service')
const { getIO } = require('../socket')
const { checkLikedComment } = require('../ultis/check-reaction')

const createComment = async (req, res, next) => {
    try {
        const author_id = req.user.userId
        const { post_id } = req.params
        const { content } = req.body

        const comment = await Comment.create({
            post_id,
            author_id,
            content
        })

        const cmtData = {
            post_id,
            author_id,
            content,
            createdAt: formatTime(comment.createdAt),
            updatedAt: formatTime(comment.updatedAt)
        }

        // tạo thông báo cho người up post qua socket
        const post = await Post.findByPk(post_id)
        if (!post) {
            return res.status(404).json({ EM: 'Bài viết không tồn tại', EC: 1 })
        }
        const postAuthor = await Account.findByPk(post.author_id)
        const commentAuthor = await Account.findByPk(author_id)

        if (postAuthor) {
            //console.log('postAuthor', postAuthor.id)
            const noti = await createNotification({
                receiver_id: postAuthor.id,
                type: 'comment',
                content: `${commentAuthor.username} đã bình luận vào bài viết của bạn`,
                link: `/posts/${post_id}`
            })
            const io = getIO()
            io.to(`user_${postAuthor.id}`).emit('new_comment', {
                id: noti.id,
                receiver_id: noti.receiver_id,
                content: noti.content,
                link: noti.link,
                type: noti.type,
                createdAt: noti.createdAt,
                post_id: post_id //trả thêm post_id để FE validate
            })
        }

        return res.status(201).json({
            EM: 'Comment thành công',
            EC: 0,
            DT: cmtData
        })


    } catch (error) {
        next(error)
    }
}

// const getAllCommentsForPost = async (req, res, next) => {
//     try {
//         const { post_id } = req.params
//         const userId = req.user?.userId || null; //check user login hay là guest
//         let myLatestComment = null;
//         let myLatestCommentId = -1;
//         let myLatestCommentData = null;

//         if (userId) {
//             myLatestComment = await Comment.findOne({  //tìm comment mới nhất của user
//                 where: { post_id, author_id: userId },
//                 order: [['createdAt', 'DESC']]
//             })
//             myLatestCommentId = myLatestComment.id //lấy ra id của comment mới nhất
//             const likeCount = await likeCountForComment(myLatestComment.id)
//             myLatestCommentData = {
//                 ...myLatestComment.toJSON(),
//                 createdAt: formatTime(myLatestComment.createdAt),
//                 updatedAt: formatTime(myLatestComment.updatedAt),
//                 likeCount
//             }
//         }

//         const otherComments = await Comment.findAll({
//             where: { post_id, id: { [Op.ne]: myLatestCommentId } }, // loại trừ comment mới nhất của user nếu có
//             order: [['createdAt', 'DESC']],
//             include: [{
//                 model: Account,
//                 attributes: ['id', 'username', 'email', 'avatar_url']
//             }]
//         })

//         const otherCommentsData = await Promise.all(
//             otherComments.map(async comment => {
//                 const likeCount = await likeCountForComment(comment.id)
//                 return {
//                     ...comment.toJSON(),
//                     createdAt: formatTime(comment.createdAt),
//                     updatedAt: formatTime(comment.updatedAt),
//                     likeCount
//                 }
//             })
//         )



//         return res.status(200).json({
//             EM: 'Lấy danh sách comment thành công',
//             EC: 0,
//             DT: {
//                 myLatestCommentData,
//                 otherCommentsData
//             }
//         })
//     } catch (error) {
//         next(error)
//     }
// }

const getCommentsForPost = async (req, res, next) => {
    try {
        const postId = req.params.post_id
        const userId = req.user?.userId || null;
        const limit = parseInt(req.query.limit) || 5; //chỉ lấy 5 cmt trên 1 lần load - parseInt vì req.query.limit là string
        const offset = parseInt(req.query.offset) || 0;

        const comments = await Comment.findAll({
            where: { post_id: postId },
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            include: [
                {
                    model: Account,
                    attributes: ['id', 'username', 'email', 'avatar_url']
                }
            ]
        })

        const likeCounts = await Promise.all(comments.map(async comment => {
            return await likeCountForComment(comment.id)
        }))

        const isLiked = await Promise.all(comments.map(async comment => {
            return await checkLikedComment(comment.id, userId)
        }))

        const cmtData = comments.map((comment, index) => {
            return {
                ...comment.toJSON(),
                createdAt: formatTime(comment.createdAt),
                updatedAt: formatTime(comment.updatedAt),
                // đều map từ comments nên index sẽ trùng nhau
                likeCount: likeCounts[index],
                isLiked: isLiked[index]
            }
        })
        res.status(200).json({
            EM: 'Lấy comment thành công',
            EC: 0,
            DT: cmtData
        })
    } catch (error) {
        next(error)
    }
}

const updateComment = async (req, res, next) => {
    try {
        const { id } = req.params
        const { content } = req.body

        const comment = await Comment.findByPk(id)
        if (!comment) {
            return res.status(404).json({ EM: 'Comment không tồn tại', EC: 1, DT: null })
        }

        if (!checkOwner(comment.author_id, req.user.userId)) {
            return res.status(403).json({ EM: 'Bạn không có quyền cập nhật comment này', EC: 1 })
        }

        await comment.update({ content })

        return res.status(200).json({
            EM: 'Cập nhật comment thành công',
            EC: 0,
            DT: comment
        })

    } catch (error) {
        next(error)
    }
}

const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params
        const comment = await Comment.findByPk(id)
        if (!comment) {
            return res.status(404).json({ EM: 'Comment không tồn tại', EC: 1, DT: null })
        }

        if (!checkOwner(comment.author_id, req.user.userId)) {
            return res.status(403).json({ EM: 'Bạn không có quyền xóa comment này', EC: 1 })
        }

        await comment.destroy()
        return res.status(200).json({
            EM: 'Xóa comment thành công',
            EC: 0
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createComment,
    //getAllCommentsForPost,
    updateComment,
    deleteComment,
    getCommentsForPost
}

