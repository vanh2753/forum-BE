const { Product, Account } = require('../models/index')
const { uploadPdfToCloudinary } = require('../ultis/cloudinary')
const { Op, Sequelize } = require("sequelize");

const createProduct = async (req, res, next) => {
    try {
        const userId = req.user?.userId
        const { title, description, price, topic_id, language } = req.body;
        const file = req.file;

        if (!title || !price || !topic_id) {
            res.status(400).json({
                EC: 1,
                EM: "Vui lòng nhập đầy đủ thông tin"
            })
        }

        if (!file) {
            res.status(400).json({
                EC: 1,
                EM: "Vui lòng upload file PDF"
            })
        }

        const fileUrl = await uploadPdfToCloudinary(file);

        const product = await Product.create({
            accountId: userId,
            title,
            description,
            price,
            topic_id,
            language,
            file_url: fileUrl
        })
        res.status(201).json({
            EC: 0,
            EM: "Thêm mới tài liệu thành công",
            DT: product
        })

    } catch (error) {
        next(error)
    }
}

const getProductList = async (req, res, next) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let offset = (page - 1) * limit;

        const total = await Product.count();

        const totalPages = Math.ceil(total / limit);

        const products = await Product.findAll({
            offset,
            limit,
            order: [['createdAt', 'DESC']]
        })


        res.status(200).json({
            EM: "Lấy danh sách sản phẩm thành công",
            EC: 0,
            DT: {
                currentPage: page,
                totalItems: total,
                totalPages: totalPages,
                products: products
            }
        });
    } catch (error) {
        next(error)
    }
}

const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({
            where: {
                id
            },
            include: [
                {
                    model: Account,
                    attributes: ['username', 'email', 'avatar_url']
                }
            ]
        })

        if (!product) {
            return res.status(404).json({
                EM: "Tài liệu không tồn tại",
                EC: 1
            })
        }

        res.status(200).json({
            EM: "Lấy tài liệu thành công",
            EC: 0,
            DT: product
        });

    } catch (error) {
        next(error)
    }
}

const queryProduct = async (req, res, next) => {
    try {
        const { searchInput, author, language, page = 1, limit = 5 } = req.query
        const offset = (page - 1) * limit;

        let query = {};
        if (searchInput) {
            query[Op.or] = [
                { title: { [Op.like]: `%${searchInput}%` } },
                { description: { [Op.like]: `%${searchInput}%` } }
            ];
        }

        const include = []; // điều kiện lọc thêm 
        if (author) {
            include.push({
                model: Account,
                where: {
                    username: {
                        [Op.like]: `%${author}%`
                    }
                },
                attributes: ['username'] // chỉ trả về tên
            })
        }
        if (language) {
            query.language = language;
        }

        const { rows, count } = await Product.findAndCountAll({
            where: query,
            include, // key trong sequelize trùng với biến array include tạo ở trên
            offset: Number(offset),
            limit: Number(limit),
            order: [['createdAt', 'DESC']],
        })

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            EM: "Lọc sản phẩm thành công",
            EC: 0,
            DT: {
                products: rows,
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
    createProduct,
    getProductList,
    getProductById,
    queryProduct
}