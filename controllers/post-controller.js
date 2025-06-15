const { Op } = require('sequelize');
const { uploadImages } = require('../ultis/cloudinary')
const { formatTime } = require('../ultis/formatTime')
const { likeCountForPost, commentCountForPost } = require('../ultis/count')
const { checkLikedPost } = require('../ultis/check-reaction')
const { Account, Post, Like, Comment, Topic } = require('../models/index')
const { checkOwner } = require('../ultis/check-owner')
const { createNotification } = require('../services/notification-service')
const { getIO } = require('../socket')

const createPost = async (req, res, next) => {
    try {
        const { topic_id, title, content } = req.body
        console.log(req.body)
        const author_id = req.user.userId
        if (!topic_id || !title || !content) {
            return res.status(400).json({
                EM: 'Vui lòng nhập đầy đủ thông tin',
                EC: 1,
            })
        }

        let finalImageUrls = []
        if (req.files) {
            try {
                finalImageUrls = await uploadImages(req.files)
                console.log(finalImageUrls)
            } catch (error) {
                return res.status(400).json({
                    EM: 'Lỗi khi tải lên ảnh',
                    EC: 1
                })
            }
        }

        const post = await Post.create({ author_id, topic_id, title, content, image_urls: finalImageUrls })
        // format time lại giờ VN
        const postData = {
            ...post.toJSON(), // Chuyển sequelize instance thành object
            createdAt: formatTime(post.createdAt),
            updatedAt: formatTime(post.updatedAt),
        }
        return res.status(201).json({
            EM: 'Tạo bài viết thành công',
            EC: 0,
            DT: postData
        })
    } catch (error) {
        next(error)
    }
}

const getAllPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit; //tính vị trí của bản ghi đầu tiên cần lấy 
        const { count, rows: posts } = await Post.findAndCountAll(
            {
                include: [
                    {
                        model: Account,
                        attributes: ['id', 'username', 'email', 'avatar_url']
                    },
                    {
                        model: Topic,
                        attributes: ['id', 'title']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: offset
            }
        )

        const totalPages = Math.ceil(count / limit);

        return res.status(200).json({
            EM: 'Lấy tất cả bài viết của user thành công',
            EC: 0,
            DT: {
                posts: posts,
                currentPage: page,
                totalPages: totalPages,
            }
        })
    } catch (error) {
        next(error)
    }
}

const getAllApprovedPosts = async (req, res, next) => {
    try {
        const userId = req.user?.userId || null;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; //tính vị trí của bản ghi đầu tiên cần lấy 

        const { count, rows } = await Post.findAndCountAll(
            {
                where: { is_approved: true },
                include: [
                    {
                        model: Account,
                        attributes: ['id', 'username', 'email', 'avatar_url']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: offset
            })

        const totalPages = Math.ceil(count / limit);

        const postsWithCounts = await Promise.all(
            rows.map(async (post) => {
                const [likeCount, commentCount] = await Promise.all([
                    Like.count({ where: { post_id: post.id } }),
                    Comment.count({ where: { post_id: post.id } }),
                ]);
                return {
                    ...post.toJSON(),
                    likeCount,
                    commentCount,
                };
            })
        );
        //console.log(postsWithCounts)

        // format time lại giờ VN
        const formatRows = postsWithCounts.map(post => ({
            ...post,
            createdAt: formatTime(post.createdAt),
            updatedAt: formatTime(post.updatedAt),
        }))

        const postData = {
            posts: formatRows,
            currentPage: page,
            totalPages: totalPages,
            totalPosts: count
        }

        return res.status(200).json({
            EM: 'Lấy tất cả bài viết đã phê duyệt thành công',
            EC: 0,
            DT: postData
        })
    } catch (error) {
        next(error)
    }
}

const getPostById = async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.user?.userId || null;

        // dùng findOne thay cho findByPk vì findByPk không thể include
        const post = await Post.findOne({
            where: { id },
            include: [
                {
                    model: Account,
                    attributes: ['username', 'email', 'avatar_url']
                }
            ]
        })

        const likeCount = await likeCountForPost(id)
        const commentCount = await commentCountForPost(id)
        const isLiked = await checkLikedPost(id, userId)

        const postData = {
            ...post.toJSON(),
            createdAt: formatTime(post.createdAt),
            updatedAt: formatTime(post.updatedAt),
            commentCount,
            likeCount,
            isLiked
        }

        return res.status(200).json({
            EM: 'Lấy bài viết thành công',
            EC: 0,
            DT: postData
        })
    } catch (error) {
        next(error)
    }
}

const getPostsForHome = async (req, res, next) => {
    try {
        const topicId = req.params.topicId;

        //Lấy 5 post mới nhất của topic đã chọn
        const posts = await Post.findAll({
            where: {
                topic_id: topicId
            },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        return res.json({
            EM: "Lấy bài viết thành công",
            EC: 0,
            DT: posts
        });
    } catch (error) {
        next(error)
    }
};

const getPostsWithPagination = async (req, res, next) => {
    try {
        const topicId = req.params.topicId
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit; //tính vị trí của bản ghi đầu tiên cần lấy 

        const { count, rows } = await Post.findAndCountAll({
            where: { topic_id: topicId },
            include: [
                {
                    model: Account,
                    attributes: ['id', 'username']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset //sequelize hỗ trợ
        })
        //console.log(count, rows)
        const totalPages = Math.ceil(count / limit);
        res.json({
            EM: 'Lấy danh sách bài viết theo topic thành công',
            EC: 0,
            DT: {
                posts: rows,
                currentPage: page,
                totalPages: totalPages,
                totalPosts: count
            }
        });
    } catch (error) {
        next(error)
    }
}

const approvePostForMod = async (req, res, next) => {
    try {
        const { id } = req.params
        const post = await Post.findByPk(id)
        if (!post) {
            return res.status(404).json({
                EM: 'Bài viết không tồn tại',
                EC: 1,
            })
        }

        // Dùng save () để update 1 đối tượng post (phải query trước) - dùng update khi cần update nhiều đối tượng (không cần query trước)
        post.is_approved = true
        await post.save()

        // tạo thông báo cho người up post qua socket
        const postAuthor = await Account.findByPk(post.author_id)
        if (postAuthor) {
            const noti = await createNotification({
                receiver_id: postAuthor.id,
                type: 'post_approved',
                content: `Bài viết của bạn đã được phê duyệt`,
                link: `/posts/${id}`
            })

            const io = getIO()
            io.emit('post_approved', {
                id: noti.id,
                receiver_id: noti.receiver_id,
                content: noti.content,
                link: noti.link,
                type: noti.type,
                createdAt: noti.createdAt,
            })
        }
        return res.status(200).json({
            EM: 'Phê duyệt bài viết thành công',
            EC: 0,
            DT: post
        })
    } catch (error) {
        next(error)
    }
}

const updatePost = async (req, res, next) => {
    try {
        const userId = req.user?.userId || null;
        const { id } = req.params
        const { topic_id, title, content, image_urls } = req.body

        const post = await Post.findByPk(id)
        if (!post) {
            return res.status(404).json({
                EM: 'Bài viết không tồn tại',
                EC: 1,
            })
        }

        if (!checkOwner(post.author_id, userId)) {
            return res.status(403).json({ EM: 'Bạn không có quyền cập nhật bài viết này', EC: 1 })
        }

        // xử lý ảnh cũ (các links)
        let oldImageLinks = [];
        try {
            oldImageLinks = JSON.parse(image_urls);
        } catch (err) {
            return res.status(400).json({ EM: 'image_urls không hợp lệ', EC: 1 });
        }

        // Xử lý ảnh mới (files)
        let newImageLinks = [];
        if (req.files && req.files.length > 0) {
            newImageLinks = await uploadImages(req.files); //trả về link ảnh từ cloud
        }

        // Gộp ảnh cũ và ảnh mới
        const updatedImageUrls = [...oldImageLinks, ...newImageLinks]; //sau khi chuyển hết về link

        post.id = id
        post.topic_id = topic_id
        post.title = title
        post.content = content
        post.image_urls = updatedImageUrls
        await post.save()

        return res.status(200).json({
            EM: 'Cập nhật bài viết thành công',
            EC: 0,
            DT: post
        })
    } catch (error) {
        next(error)
    }
}

const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params
        const post = await Post.findByPk(id)
        if (!post) {
            return res.status(404).json({
                EM: 'Bài viết không tồn tại',
                EC: 1,
            })
        }

        if (!checkOwner(post.author_id, req.user.userId)) {
            return res.status(403).json({ EM: 'Bạn không có quyền xóa bài viết này', EC: 1 })
        }

        await post.destroy()
        return res.status(200).json({
            EM: 'Bài viết đã được xóa',
            EC: 0,
        })
    } catch (error) {
        next(error)
    }
}

const queryPost = async (req, res, next) => {
    try {
        const { searchInput, page = 1, limit = 5 } = req.query
        const offset = (page - 1) * limit;

        let query = {};
        if (searchInput) {
            query[Op.or] = [
                { title: { [Op.like]: `%${searchInput}%` } },
                { content: { [Op.like]: `%${searchInput}%` } }
            ];
        }
        const { rows, count } = await Post.findAndCountAll({
            where: query,
            include: [
                {
                    model: Account,
                    attributes: ['id', 'username', 'email', 'avatar_url'],
                    required: false,
                },
                {
                    model: Topic,
                    attributes: ['id', 'title'],
                    required: false,
                }
            ],
            offset: Number(offset),
            limit: Number(limit),
            order: [['createdAt', 'DESC']],
        })

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            EM: "Lấy kết quả tìm kiếm bài viết",
            EC: 0,
            DT: {
                posts: rows,
                currentPage: page,
                totalPages: totalPages,
                totalPosts: count
            }
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createPost,
    getAllPosts,
    approvePostForMod,
    getAllApprovedPosts,
    getPostById,
    updatePost,
    deletePost,
    getPostsForHome,
    getPostsWithPagination,
    queryPost
}
