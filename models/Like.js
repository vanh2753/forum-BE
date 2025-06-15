const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Like extends Model { }

Like.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'accounts',
            key: 'id'
        }
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'posts',
            key: 'id'
        }
    },
    comment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'comments',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'Like',
    tableName: 'likes',
    timestamps: true
});

module.exports = Like; 