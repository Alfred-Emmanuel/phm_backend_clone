'use strict';

/**
 * Migration to add user_image_public_id column to users table.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'user_image_public_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'user_image_public_id');
  },
};
