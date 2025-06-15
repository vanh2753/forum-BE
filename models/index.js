const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

const Account = require('./Account');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Notification = require('./Notification');
const Report = require('./Report');
const Product = require('./Product');
const Order = require('./Order');
const Article = require('./Article');
const Topic = require('./Topic');

const applyAssociations = require('./associate');

applyAssociations(); // áp dụng các quan hệ giữa các model

// sau này sử dụng model thì import từ đây
module.exports = {
    sequelize,
    Account,
    Post,
    Comment,
    Like,
    Notification,
    Report,
    Product,
    Order,
    Article,
    Topic
};
