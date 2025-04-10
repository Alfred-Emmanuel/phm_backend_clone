'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'isEmailVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false, // Assuming verification is required to be explicitly true/false
    });
    await queryInterface.addColumn('users', 'emailVerificationToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'emailVerificationExpires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'emailVerificationExpires');
    await queryInterface.removeColumn('users', 'emailVerificationToken');
    await queryInterface.removeColumn('users', 'isEmailVerified');
  },
};
