'use strict';

/**
 * Migration to ensure all lesson fields are snake_case in the database.
 * This migration will rename columns in the lessons table to snake_case if needed.
 * Adjust the table and column names as necessary for your schema.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename columns to snake_case if they exist in camelCase
    // Adjust these names if your table or columns are different
    const table = 'lessons';
    const renameMap = [
      { from: 'courseId', to: 'course_id' },
      { from: 'videoUrl', to: 'video_url' },
      { from: 'videoPublicId', to: 'video_public_id' },
      { from: 'createdAt', to: 'created_at' },
      { from: 'updatedAt', to: 'updated_at' },
      // Add more fields if needed
    ];

    for (const { from, to } of renameMap) {
      // Only rename if the camelCase column exists and snake_case does not
      const tableDesc = await queryInterface.describeTable(table);
      if (tableDesc[from] && !tableDesc[to]) {
        await queryInterface.renameColumn(table, from, to);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert the column names back to camelCase
    const table = 'lessons';
    const renameMap = [
      { from: 'course_id', to: 'courseId' },
      { from: 'video_url', to: 'videoUrl' },
      { from: 'video_public_id', to: 'videoPublicId' },
      { from: 'createdAt', to: 'created_at' },
      { from: 'updatedAt', to: 'updated_at' },
      // Add more fields if needed
    ];

    for (const { from, to } of renameMap) {
      const tableDesc = await queryInterface.describeTable(table);
      if (tableDesc[from] && !tableDesc[to]) {
        await queryInterface.renameColumn(table, from, to);
      }
    }
  },
};
