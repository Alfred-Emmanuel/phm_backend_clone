'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First create the enum types
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_courses_level') THEN
          CREATE TYPE enum_courses_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_courses_status') THEN
          CREATE TYPE enum_courses_status AS ENUM ('draft', 'published', 'archived');
        END IF;
      END
      $$;
    `);

    // Update existing data to match enum values
    await queryInterface.sequelize.query(`
      UPDATE courses 
      SET level = CASE 
        WHEN level NOT IN ('Beginner', 'Intermediate', 'Advanced') THEN NULL 
        ELSE level 
      END;
    `);

    await queryInterface.sequelize.query(`
      UPDATE courses 
      SET status = CASE 
        WHEN status NOT IN ('draft', 'published', 'archived') THEN 'draft' 
        ELSE status 
      END;
    `);

    // Drop the default value constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE courses 
      ALTER COLUMN status DROP DEFAULT;
    `);

    // Alter the columns to use the enum types
    await queryInterface.sequelize.query(`
      ALTER TABLE courses 
      ALTER COLUMN level TYPE enum_courses_level USING level::enum_courses_level;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE courses 
      ALTER COLUMN status TYPE enum_courses_status USING status::enum_courses_status;
    `);

    // Add back the default value
    await queryInterface.sequelize.query(`
      ALTER TABLE courses 
      ALTER COLUMN status SET DEFAULT 'draft'::enum_courses_status;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop the default value constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE courses 
      ALTER COLUMN status DROP DEFAULT;
    `);

    // Convert enum columns back to string
    await queryInterface.sequelize.query(`
      ALTER TABLE courses 
      ALTER COLUMN level TYPE VARCHAR(255);
      
      ALTER TABLE courses 
      ALTER COLUMN status TYPE VARCHAR(255);
    `);

    // Add back the string default
    await queryInterface.sequelize.query(`
      ALTER TABLE courses 
      ALTER COLUMN status SET DEFAULT 'draft';
    `);

    // Drop the enum types
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_courses_level;
      DROP TYPE IF EXISTS enum_courses_status;
    `);
  },
};
