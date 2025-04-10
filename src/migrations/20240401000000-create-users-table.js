'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the table already exists (e.g., created by Supabase Auth)
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('users')) {
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        firstName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        // role: { // Removed role column - let Supabase handle it
        //   type: Sequelize.STRING,
        //   allowNull: false,
        //   defaultValue: 'student',
        // },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Optionally, only drop the table if you're sure it wasn't managed by Supabase
    // For safety, you might skip dropping it here or add checks.
    await queryInterface.dropTable('users');
  },
};
