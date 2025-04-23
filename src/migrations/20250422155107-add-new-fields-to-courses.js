'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    });

    await queryInterface.addColumn('courses', 'is_free', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('courses', 'duration', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'featured_image', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'level', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'requirements', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'learning_outcomes', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'target_audience', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'draft',
    });

    await queryInterface.addColumn('courses', 'enrollment_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('courses', 'price');
    await queryInterface.removeColumn('courses', 'is_free');
    await queryInterface.removeColumn('courses', 'duration');
    await queryInterface.removeColumn('courses', 'featured_image');
    await queryInterface.removeColumn('courses', 'level');
    await queryInterface.removeColumn('courses', 'requirements');
    await queryInterface.removeColumn('courses', 'learning_outcomes');
    await queryInterface.removeColumn('courses', 'target_audience');
    await queryInterface.removeColumn('courses', 'status');
    await queryInterface.removeColumn('courses', 'enrollment_count');
  },
};
