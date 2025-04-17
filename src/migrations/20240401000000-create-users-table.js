// database/migrations/YYYYMMDDHHMMSS-create-users.js (Replace YYYY... with actual timestamp)
'use strict';

// --- Define ENUMs for use in migration ---
// Note: Defining ENUMs directly in createTable can sometimes be tricky across DBs/versions.
// An alternative is creating the ENUM TYPE separately first using queryInterface.createEnumType
// and then referencing it, but for simplicity, we'll define inline here. Check PostgeSQL docs if issues arise.
const GsmNetworkValues = ['mtn', 'airtel', 'glo', '9mobile'];
const ProfessionValues = [
  'community pharmacist',
  'hospital pharmacist',
  'academic pharmacist',
  'administrative pharmacist',
  'industrial pharmacist',
  'counter assistant',
  'pharmacy student', // Corrected typo from 'studen'
  'others',
];
const NigerianStateValues = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'Federal Capital Territory',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];
const RoleValues = ['student', 'instructor', 'admin'];
const InstructorStatusValues = ['pending', 'approved', 'rejected'];
// --- End ENUM Definitions ---

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the table already exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('users')) {
      await queryInterface.createTable('users', {
        // --- Core Fields ---
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        first_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        last_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          // Storing the hash, ensure length is sufficient
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        role: {
          type: Sequelize.ENUM(...RoleValues),
          allowNull: false,
          defaultValue: 'student',
        },

        // --- Instructor Specific ---
        instructor_status: {
          type: Sequelize.ENUM(...InstructorStatusValues),
          allowNull: true, // Nullable for non-instructors or pending status interpretation
        },

        // --- Email Verification ---
        is_email_verified: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        email_verification_token: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        email_verification_expires: {
          type: Sequelize.DATE, // Or TIMESTAMP WITH TIME ZONE
          allowNull: true,
        },

        // --- Profile/Contact Fields ---
        gsm_network: {
          type: Sequelize.ENUM(...GsmNetworkValues),
          allowNull: false, // Matches your entity
        },
        phone_number: {
          type: Sequelize.STRING,
          allowNull: false, // Matches your entity
        },
        state: {
          type: Sequelize.ENUM(...NigerianStateValues),
          allowNull: true, // Matches your entity (was true)
        },
        pcn_number: {
          type: Sequelize.STRING,
          allowNull: false, // Matches your entity
        },
        country: {
          type: Sequelize.STRING,
          allowNull: true, // Matches your entity
        },
        place_of_work: {
          type: Sequelize.TEXT, // Use TEXT for potentially longer descriptions
          allowNull: false, // Matches your entity
        },
        professional_cadre: {
          type: Sequelize.ENUM(...ProfessionValues),
          allowNull: false, // Matches your entity
        },
        others: {
          type: Sequelize.TEXT,
          allowNull: true, // Matches your entity
        },

        // --- Timestamps ---
        created_at: {
          allowNull: false,
          type: Sequelize.DATE, // Or TIMESTAMP WITH TIME ZONE
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE, // Or TIMESTAMP WITH TIME ZONE
          defaultValue: Sequelize.NOW,
        },
      });

      // Add index on email for faster lookups
      await queryInterface.addIndex('users', ['email']);
      // Add index on role for filtering
      await queryInterface.addIndex('users', ['role']);
    } else {
      console.log("Table 'users' already exists. Migration skipped.");
      // Optionally, add ALTER TABLE statements here if you need to add columns
      // to an existing table managed outside this migration.
      // Example:
      // await queryInterface.addColumn('users', 'new_column', { type: Sequelize.STRING });
    }
  },

  async down(queryInterface, Sequelize) {
    // Reverses the migration - drops the table
    // Be cautious if other parts of your system depend on this table existing
    await queryInterface.dropTable('users');
    // If you created ENUM types separately, drop them here too:
    // await queryInterface.dropEnumType('enum_users_role');
    // etc.
  },
};
