// database/migrations/YYYYMMDDHHMMSS-add-indexes-to-courses.js (Or your actual filename)
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Helper function to add index and ignore "already exists" errors (specifically for PostgreSQL 42P07 code)
  async addIndexIfNotExists(queryInterface, tableName, fields, options) {
    try {
      await queryInterface.addIndex(tableName, fields, options);
      console.log(
        `Index ${options?.name || fields.join('_')} on ${tableName} created or verified.`,
      );
    } catch (error) {
      // Check if the error is the PostgreSQL "duplicate object" error (code 42P07)
      if (
        error.name === 'SequelizeDatabaseError' &&
        error.parent?.code === '42P07'
      ) {
        console.warn(
          `Index ${options?.name || fields.join('_')} on ${tableName} already exists, skipping creation.`,
        );
      } else {
        // Re-throw any other errors
        console.error(
          `Error adding index ${options?.name || fields.join('_')} on ${tableName}:`,
          error,
        );
        throw error;
      }
    }
  },

  async up(queryInterface, Sequelize) {
    // Use the helper function for each index creation
    await this.addIndexIfNotExists(
      queryInterface,
      'courses',
      ['instructor_id'],
      {
        name: 'idx_instructor_id',
      },
    );

    await this.addIndexIfNotExists(
      queryInterface,
      'course_enrollments',
      ['user_id'],
      {
        name: 'idx_user_id',
      },
    );

    await this.addIndexIfNotExists(
      queryInterface,
      'course_enrollments',
      ['course_id'],
      {
        name: 'idx_course_id',
      },
    );

    // For indexes where Sequelize generates the name (based on column name)
    // Provide the expected column name(s) in the fields array
    await this.addIndexIfNotExists(queryInterface, 'courses', ['price']); // Default name might be courses_price
    await this.addIndexIfNotExists(queryInterface, 'courses', ['is_free']); // Default name might be courses_is_free
    await this.addIndexIfNotExists(queryInterface, 'courses', ['level']); // Default name might be courses_level
    await this.addIndexIfNotExists(queryInterface, 'courses', ['status']); // Default name might be courses_status

    // Note: Using Promise.all might hide which specific index failed if one *other* than
    // "already exists" occurs. Running them sequentially with the helper is safer for debugging.
  },

  async down(queryInterface, Sequelize) {
    // removeIndex usually doesn't fail if the index doesn't exist, but wrapping is safest
    const removeIndexSafe = async (tableName, indexName) => {
      try {
        await queryInterface.removeIndex(tableName, indexName);
        console.log(`Index ${indexName} on ${tableName} removed.`);
      } catch (error) {
        // Ignore "does not exist" errors potentially, log others
        console.warn(
          `Could not remove index ${indexName} from ${tableName} (may not exist):`,
          error.message,
        );
      }
    };

    await removeIndexSafe('courses', 'idx_instructor_id');
    await removeIndexSafe('course_enrollments', 'idx_user_id');
    await removeIndexSafe('course_enrollments', 'idx_course_id');
    await removeIndexSafe('courses', 'price');
    await removeIndexSafe('courses', 'is_free');
    await removeIndexSafe('courses', 'level');
    await removeIndexSafe('courses', 'status');

    // Note: If using Promise.all here, ensure you handle potential rejections if needed.
    // await Promise.all([
    //   queryInterface.removeIndex('courses', 'idx_instructor_id'),
    //   // ... other removeIndex calls
    // ]);
  },
};
