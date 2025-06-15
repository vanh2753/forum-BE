const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Notification extends Model { }

Notification.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'accounts',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true
});

module.exports = Notification; 