const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "accounts",
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    total_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vnpay_txn_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: true,
  }
);

module.exports = Order;
