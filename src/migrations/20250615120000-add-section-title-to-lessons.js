'use strict';

/**
 * Migration to add section_title column to lessons table.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('lessons', 'section_title', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('lessons', 'section_title');
  },
};
