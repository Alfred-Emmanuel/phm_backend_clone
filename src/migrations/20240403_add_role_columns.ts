'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Skip ENUM creation entirely for this migration
    // await queryInterface.sequelize.query(
    //  `CREATE TYPE IF NOT EXISTS "enum_users_role" AS ENUM('admin', 'student', 'instructor');`
    // );
    // await queryInterface.sequelize.query(
    //  `CREATE TYPE "enum_users_instructorStatus" AS ENUM('pending', 'approved', 'rejected');`
    // );

    // Add columns as STRING type for now to avoid ENUM issues during migration
    // Commented out role addition as Supabase likely handles it
    // await queryInterface.addColumn('users', 'role', {
    //   type: Sequelize.STRING, // Changed from enum
    //   allowNull: false,
    //   defaultValue: 'student',
    // });

    await queryInterface.addColumn('users', 'instructorStatus', {
      type: Sequelize.STRING, // Changed from enum
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'instructorStatus');
    // await queryInterface.removeColumn('users', 'role'); // Keep commented
    // Skip ENUM dropping
    // await queryInterface.sequelize.query(
    //   'DROP TYPE IF EXISTS "enum_users_role";',
    // );
    // await queryInterface.sequelize.query(
    //   'DROP TYPE IF EXISTS "enum_users_instructorStatus";',
    // );
  },
};
