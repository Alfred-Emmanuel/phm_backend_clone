'use strict';

/**
 * Migration to change video_url column type from STRING to TEXT in lessons table.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('lessons', 'video_url', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('lessons', 'video_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
