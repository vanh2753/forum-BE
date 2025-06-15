'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('likes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'accounts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'posts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      comment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'comments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // thêm rằng buộc unique cho user_id và post_id
    // không thể có 2 bản ghi giống nhau về user_id và post_id trong bảng likes
    await queryInterface.addConstraint('likes', {
      fields: ['user_id', 'post_id'],
      type: 'unique',
      name: 'unique_user_post_like'
    });

    await queryInterface.addConstraint('likes', {
      fields: ['user_id', 'comment_id'],
      type: 'unique',
      name: 'unique_user_comment_like'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('likes');
  }
};
