const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Report extends Model { }

Report.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    target_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'accounts',
            key: 'id'
        }
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false
    },
    handled_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'accounts',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'Report',
    tableName: 'reports',
    timestamps: true
});

module.exports = Report; 