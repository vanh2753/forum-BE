const { Like } = require('../models/index')

const checkLikedPost = async (postId, userId) => {
    const like = await Like.findOne({ where: { post_id: postId, user_id: userId } });
    return like ? true : false;
}

const checkLikedComment = async (commentId, userId) => {
    const like = await Like.findOne({ where: { comment_id: commentId, user_id: userId } });
    return like ? true : false;
}

module.exports = {
    checkLikedPost,
    checkLikedComment
}
