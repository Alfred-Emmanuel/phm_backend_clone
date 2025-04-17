'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM type for users.role if it doesn't exist (PostgreSQL specific)
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_users_role" AS ENUM('student', 'instructor', 'admin');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
    }

    // Add role column
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('student', 'instructor', 'admin'),
      allowNull: false,
      defaultValue: 'student',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'role');

    // Drop ENUM type if it exists (PostgreSQL specific)
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_users_role";',
      );
    }
  },
};
