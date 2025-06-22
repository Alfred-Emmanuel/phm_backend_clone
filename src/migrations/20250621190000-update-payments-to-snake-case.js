'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename columns to snake_case if they exist in camelCase
    const table = 'payments';
    const renameIfExists = async (from, to, type) => {
      const tableDesc = await queryInterface.describeTable(table);
      if (tableDesc[from]) {
        await queryInterface.renameColumn(table, from, to);
      } else if (!tableDesc[to]) {
        // If neither exists, create the column (for new deployments)
        await queryInterface.addColumn(table, to, type);
      }
    };
    await renameIfExists('userId', 'user_id', { type: Sequelize.UUID });
    await renameIfExists('courseId', 'course_id', { type: Sequelize.UUID });
    await renameIfExists('gatewayResponse', 'gateway_response', {
      type: Sequelize.TEXT,
    });
    await renameIfExists('createdAt', 'created_at', { type: Sequelize.DATE });
    await renameIfExists('updatedAt', 'updated_at', { type: Sequelize.DATE });
    // Optionally, drop old camelCase columns if they still exist
    // (Uncomment if you want to force cleanup)
    // await queryInterface.removeColumn(table, 'userId');
    // await queryInterface.removeColumn(table, 'courseId');
    // await queryInterface.removeColumn(table, 'gatewayResponse');
    // await queryInterface.removeColumn(table, 'createdAt');
    // await queryInterface.removeColumn(table, 'updatedAt');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert snake_case columns back to camelCase
    const table = 'payments';
    const renameIfExists = async (from, to, type) => {
      const tableDesc = await queryInterface.describeTable(table);
      if (tableDesc[from]) {
        await queryInterface.renameColumn(table, from, to);
      }
    };
    await renameIfExists('user_id', 'userId', { type: Sequelize.UUID });
    await renameIfExists('course_id', 'courseId', { type: Sequelize.UUID });
    await renameIfExists('gateway_response', 'gatewayResponse', {
      type: Sequelize.TEXT,
    });
    await renameIfExists('created_at', 'createdAt', { type: Sequelize.DATE });
    await renameIfExists('updated_at', 'updatedAt', { type: Sequelize.DATE });
  },
};
