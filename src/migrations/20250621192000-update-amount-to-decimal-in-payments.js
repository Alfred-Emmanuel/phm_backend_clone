'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('payments', 'amount', {
      type: Sequelize.DECIMAL(20, 2), // Up to 18 digits before decimal, 2 after
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('payments', 'amount', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
