'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM type for categories.type if it doesn't exist (PostgreSQL specific)
    // For other databases, Sequelize handles ENUMs directly in createTable
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_categories_type" AS ENUM('paid', 'free', 'other');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
    }

    // Determine JSON type based on dialect
    const jsonType = dialect === 'postgres' ? DataTypes.JSONB : DataTypes.JSON;

    // Create admins table
    await queryInterface.createTable('admins', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users', // Assumes users table name is 'users'
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      job_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      permissions: {
        type: jsonType,
        allowNull: true,
      },
      is_super_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create admin_action_logs table
    await queryInterface.createTable('admin_action_logs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      admin_user_id: {
        type: DataTypes.UUID,
        allowNull: false, // Rule specifies NOT NULL
        references: {
          model: 'users', // Assumes users table name is 'users'
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Rule specifies SET NULL on delete
      },
      action_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      target_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      target_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      details: {
        type: jsonType,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    // Add index on admin_user_id for faster log lookups
    await queryInterface.addIndex('admin_action_logs', ['admin_user_id']);

    // Create categories table
    await queryInterface.createTable('categories', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type:
          dialect === 'postgres'
            ? 'enum_categories_type' // Use predefined ENUM type for PostgreSQL
            : DataTypes.ENUM('paid', 'free', 'other'), // Direct ENUM for others
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    // Add index on slug for faster lookups
    await queryInterface.addIndex('categories', ['slug']);

    // Create course_categories join table
    await queryInterface.createTable('course_categories', {
      course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true, // Part of composite primary key
        references: {
          model: 'courses', // Assumes courses table name is 'courses'
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true, // Part of composite primary key
        references: {
          model: 'categories', // References the categories table created above
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // Sequelize automatically adds created_at/updated_at if timestamps: true is used in model
      // If manual timestamps are needed, add them here like:
      // created_at: {
      //   allowNull: false,
      //   type: DataTypes.DATE,
      //   defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      // },
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order of creation to respect FK constraints
    await queryInterface.dropTable('course_categories');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('admin_action_logs');
    await queryInterface.dropTable('admins');

    // Drop ENUM type if it exists (PostgreSQL specific)
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_categories_type";',
      );
    }
  },
};
