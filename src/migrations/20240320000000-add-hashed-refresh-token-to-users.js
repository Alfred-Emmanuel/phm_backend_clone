const { DataTypes } = require('sequelize');

('use strict');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('users', 'hashed_refresh_token', {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'hashed_refresh_token');
  },
};
