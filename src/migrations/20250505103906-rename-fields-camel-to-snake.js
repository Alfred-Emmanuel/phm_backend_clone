'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename fields in categories
    await queryInterface.renameColumn('categories', 'createdAt', 'created_at');
    await queryInterface.renameColumn('categories', 'updatedAt', 'updated_at');

    // Rename fields in course_categories
    await queryInterface.renameColumn(
      'course_categories',
      'courseId',
      'course_id',
    );
    await queryInterface.renameColumn(
      'course_categories',
      'categoryId',
      'category_id',
    );

    // Rename fields in assignments
    await queryInterface.renameColumn('assignments', 'dueDate', 'due_date');
    await queryInterface.renameColumn('assignments', 'courseId', 'course_id');
    await queryInterface.renameColumn('assignments', 'createdAt', 'created_at');
    await queryInterface.renameColumn('assignments', 'updatedAt', 'updated_at');
  },

  async down(queryInterface, Sequelize) {
    // Revert changes in categories
    await queryInterface.renameColumn('categories', 'created_at', 'createdAt');
    await queryInterface.renameColumn('categories', 'updated_at', 'updatedAt');

    // Revert changes in course_categories
    await queryInterface.renameColumn(
      'course_categories',
      'course_id',
      'courseId',
    );
    await queryInterface.renameColumn(
      'course_categories',
      'category_id',
      'categoryId',
    );

    // Revert changes in assignments
    await queryInterface.renameColumn('assignments', 'due_date', 'dueDate');
    await queryInterface.renameColumn('assignments', 'course_id', 'courseId');
    await queryInterface.renameColumn('assignments', 'created_at', 'createdAt');
    await queryInterface.renameColumn('assignments', 'updated_at', 'updatedAt');
  },
};
