'use strict';

/**
 * Migration to add user_image column to users table.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'user_image', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'user_image');
  },
};
