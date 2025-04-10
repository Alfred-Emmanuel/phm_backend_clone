'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Check if SequelizeMeta table exists
      const tableExists = await queryInterface.sequelize.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'SequelizeMeta'
        );`,
        { type: queryInterface.sequelize.QueryTypes.SELECT },
      );

      if (!tableExists[0].exists) {
        // Create SequelizeMeta table if it doesn't exist
        await queryInterface.createTable(
          'SequelizeMeta',
          {
            name: {
              type: Sequelize.STRING,
              allowNull: false,
              unique: true,
              primaryKey: true,
            },
          },
          { transaction },
        );
      }

      // Check if migrations are already recorded
      const existingMigrations = await queryInterface.sequelize.query(
        `SELECT name FROM "SequelizeMeta" WHERE name IN ('20240403_add_role_columns.ts', '20240407-add-user-fields.ts');`,
        { type: queryInterface.sequelize.QueryTypes.SELECT },
      );

      const migrationsToAdd = [
        '20240403_add_role_columns.ts',
        '20240407-add-user-fields.ts',
      ].filter(
        (migration) => !existingMigrations.some((m) => m.name === migration),
      );

      if (migrationsToAdd.length > 0) {
        // Insert records for missing migrations
        await queryInterface.bulkInsert(
          'SequelizeMeta',
          migrationsToAdd.map((name) => ({ name })),
          { transaction },
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.bulkDelete(
        'SequelizeMeta',
        {
          name: {
            [Sequelize.Op.in]: [
              '20240403_add_role_columns.ts',
              '20240407-add-user-fields.ts',
            ],
          },
        },
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
