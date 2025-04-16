const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // Add granted_admin_by column
    await queryInterface.addColumn('users', 'granted_admin_by', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add status column if it doesn't exist
    const tableDescription = await queryInterface.describeTable('users');
    if (!tableDescription.status) {
      await queryInterface.addColumn('users', 'status', {
        type: DataTypes.ENUM(
          'active',
          'suspended',
          'pending_email_verification',
        ),
        allowNull: false,
        defaultValue: 'active',
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'granted_admin_by');
    await queryInterface.removeColumn('users', 'status');
  },
};
