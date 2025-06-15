const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Article extends Model { }

Article.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT('long'), // dùng để tương tác với Quill
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Article',
    tableName: 'articles',
    timestamps: true
});

module.exports = Article; 