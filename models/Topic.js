const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Topic extends Model { }

Topic.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Topic',
    tableName: 'topics',
    timestamps: true
});

module.exports = Topic; 