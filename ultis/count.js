const { Like, Comment } = require('../models/index')

const likeCountForPost = async (postId) => {
    const likes = await Like.count({ where: { post_id: postId } });
    return likes;
}

const likeCountForComment = async (commentId) => {
    const likes = await Like.count({ where: { comment_id: commentId } });
    return likes;
}

const commentCountForPost = async (postId) => {
    const comments = await Comment.count({ where: { post_id: postId } });
    return comments;
}

module.exports = {
    likeCountForPost,
    likeCountForComment,
    commentCountForPost
}
