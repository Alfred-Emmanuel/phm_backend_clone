'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('admin', 'student', 'instructor'),
      allowNull: false,
      defaultValue: 'student',
    });

    await queryInterface.addColumn('Users', 'instructorStatus', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'instructorStatus');
    await queryInterface.removeColumn('Users', 'role');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Users_role";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Users_instructorStatus";',
    );
  },
};
