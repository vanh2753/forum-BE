"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  //thêm topic, languague, views
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("products", "topic_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "topics",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addColumn("products", "language", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });

    await queryInterface.addColumn("products", "views", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // Thêm product_id và payment_status vào bảng orders
    await queryInterface.addColumn("orders", "product_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addColumn("orders", "payment_status", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("products", "price", {
      type: Sequelize.FLOAT,
      allowNull: false,
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("products", "topic_id");
    await queryInterface.removeColumn("products", "language");
    await queryInterface.removeColumn("products", "views");

    await queryInterface.removeColumn("orders", "product_id");
    await queryInterface.removeColumn("orders", "payment_status");

    await queryInterface.changeColumn("products", "price", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

  },
};
