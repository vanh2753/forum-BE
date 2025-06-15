const Account = require("./Account");
const Post = require("./Post");
const Comment = require("./Comment");
const Like = require("./Like");
const Notification = require("./Notification");
const Report = require("./Report");
const Product = require("./Product");
const Order = require("./Order");
const Article = require("./Article");
const Topic = require("./Topic");
const applyAssociations = () => {
  // Account
  Account.hasMany(Post, { foreignKey: "author_id" });
  Account.hasMany(Comment, { foreignKey: "author_id" });
  Account.hasMany(Like, { foreignKey: "user_id" });
  Account.hasMany(Notification, { foreignKey: "receiver_id" });
  Account.hasMany(Report, { foreignKey: "target_id" });
  Account.hasMany(Report, { foreignKey: "handled_by" });
  Account.hasMany(Product, { foreignKey: "accountId" });
  Account.hasMany(Order, { foreignKey: "user_id" });
  Account.hasMany(Article, { foreignKey: "accountId" });

  // Post
  Post.belongsTo(Account, { foreignKey: "author_id" });
  Post.belongsTo(Topic, { foreignKey: "topic_id" });
  Post.hasMany(Comment, { foreignKey: "post_id" });
  Post.hasMany(Like, { foreignKey: "post_id" });

  // Comment
  Comment.belongsTo(Account, { foreignKey: "author_id" });
  Comment.belongsTo(Post, { foreignKey: "post_id" });
  Comment.hasMany(Like, { foreignKey: "comment_id" });

  // Like
  Like.belongsTo(Account, { foreignKey: "user_id" });
  Like.belongsTo(Post, { foreignKey: "post_id" });
  Like.belongsTo(Comment, { foreignKey: "comment_id" });

  // Notification
  Notification.belongsTo(Account, { foreignKey: "receiver_id" });

  // Report
  Report.belongsTo(Account, { foreignKey: "target_id" });
  Report.belongsTo(Account, { foreignKey: "handled_by" });

  // Product
  Product.belongsTo(Account, { foreignKey: "accountId" });
  Product.belongsTo(Topic, { foreignKey: "topic_id" }); // <-- thêm quan hệ topic

  // Order
  Order.belongsTo(Account, { foreignKey: "user_id" });
  Order.belongsTo(Product, { foreignKey: "product_id" }); // <-- thêm quan hệ product

  // Article
  Article.belongsTo(Account, { foreignKey: "accountId" });

  // Topic
  Topic.hasMany(Post, { foreignKey: "topic_id" });
  Topic.hasMany(Product, { foreignKey: "topic_id" }); // <-- nếu muốn truy ngược sản phẩm
};

module.exports = applyAssociations;
