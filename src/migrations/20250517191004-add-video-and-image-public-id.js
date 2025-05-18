'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('lessons', 'video_public_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'image_public_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('lessons', 'video_public_id');
    await queryInterface.removeColumn('courses', 'image_public_id');
  },
};
