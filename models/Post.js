const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Post extends Model { }

Post.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    author_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'accounts',
            key: 'id'
        }
    },
    topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'topics',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    image_urls: {
        type: DataTypes.JSON,  // Dùng kiểu JSON tránh lỗi
        allowNull: true,
        defaultValue: []  // Mặc định là một mảng rỗng
    },
    is_approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true
});

module.exports = Post; 