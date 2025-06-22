'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('payments', 'course_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('payments', 'course_id', {
      type: Sequelize.UUID,
      allowNull: true,
      field: 'course_id',
    });
  },
};
