const { uploadArticleImage } = require("../ultis/cloudinary");
const { Article, Account } = require("../models/index");
const { Op, Sequelize } = require("sequelize");
const cheerio = require("cheerio");

const articleImageHandle = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Chưa tải được file ảnh" });

    const url = await uploadArticleImage(file);
    return res.json({ location: url }); // TinyMCE yêu cầu
  } catch (err) {
    next(err);
  }
};

const extractExcerptAndImage = (html) => {
  const $ = cheerio.load(html);
  let excerpt = $("p").first().text().trim();
  if (excerpt.length > 200) {
    excerpt = excerpt.slice(0, 100) + "...";
  }

  const image = $("img").first().attr("src") || null;

  return { excerpt, image };
};

const createArticle = async (req, res, next) => {
  try {
    const accountId = req.user.userId;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        EM: "Tiêu đề và nội dung không được để trống",
        EC: 1,
      });
    }

    const article = await Article.create({ title, content, accountId });
    return res.status(201).json({
      EM: "Tạo tin tức thành công",
      EC: 0,
      DT: article,
    });
  } catch (error) {
    next(error);
  }
};

const getNewsItem = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Article.findAndCountAll({
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });

    const dataWithExtras = rows.map((article) => {
      const { excerpt, image } = extractExcerptAndImage(article.content);
      return {
        id: article.id,
        title: article.title,
        createdAt: article.createdAt,
        excerpt,
        image,
      };
    });

    return res.status(200).json({
      EM: "Lấy tin tức thành công",
      EC: 0,
      DT: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        items: dataWithExtras,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await Article.findOne({
      where: { id },
      include: [
        {
          model: Account,
          attributes: ["username", "email", "avatar_url"],
        },
      ],
    });

    if (!article) {
      return res.status(404).json({
        EM: "Tin tức không tồn tại",
        EC: 1,
      });
    }
    return res.status(200).json({
      EM: "Lấy bài báo thành công",
      EC: 0,
      DT: article,
    });
  } catch (error) {
    next(error);
  }
};

const getRandomArticlesInOneWeek = async (req, res, next) => {
  try {
    const today = new Date(); // hôm nay
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7); // 7 ngày trước

    const articles = await Article.findAll({
      where: {
        createdAt: {
          [Op.gte]: oneWeekAgo, // Op.gte là >=
        },
      },
      order: Sequelize.literal("RAND()"), // RAND cho Mysql
      limit: 5,
    });

    const articlesWithImages = articles.map((article) => {
      const { excerpt, image } = extractExcerptAndImage(article.content);
      return {
        ...article.toJSON(),
        excerpt,
        image,
      };
    });
    res.status(200).json({
      EC: 0,
      EM: "Lấy 5 bài viết ngẫu nhiên trong tuần vừa rồi",
      DT: articlesWithImages,
    });
  } catch (error) {
    next(error);
  }
};

const queryAriticles = async (req, res, next) => {
  try {
    const { searchInput, page = 1, limit = 5 } = req.query
    const offset = (page - 1) * limit;

    let query = {};
    if (searchInput) {
      query = { title: { [Op.like]: `%${searchInput}%` } }
    }
    const { rows, count } = await Article.findAndCountAll({
      where: query,
      offset: Number(offset),
      limit: Number(limit),
      order: [['createdAt', 'DESC']],
    })

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      EM: "Lấy kết quả tìm kiếm bài viết",
      EC: 0,
      DT: {
        items: rows,
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
  articleImageHandle,
  createArticle,
  getNewsItem,
  getArticleById,
  getRandomArticlesInOneWeek,
  queryAriticles
};
