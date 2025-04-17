// database/seeders/YYYYMMDDHHMMSS-seed-users-with-roles.js
'use strict';
// Import bcrypt for password hashing
const bcrypt = require('bcrypt');
// Import UUID generator if your PKs are UUIDs
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords before seeding
    const saltRounds = 10; // Use the same number of rounds as your app
    const studentPasswordHash = await bcrypt.hash('password123', saltRounds);
    const instructorPasswordHash = await bcrypt.hash('password456', saltRounds);
    const adminPasswordHash = await bcrypt.hash('adminpass', saltRounds);
    const superAdminPasswordHash = await bcrypt.hash(
      'superadminpass',
      saltRounds,
    );

    // Generate UUIDs for users if needed
    const studentId = uuidv4();
    const instructorId = uuidv4();
    const adminId = uuidv4();
    const superAdminId = uuidv4();

    // --- Seed Users Table ---
    await queryInterface.bulkInsert(
      'users',
      [
        {
          id: studentId,
          first_name: 'Test',
          last_name: 'Student',
          email: 'student.seed@test.com',
          password: studentPasswordHash,
          role: 'student',
          instructor_status: null,
          is_email_verified: true,
          email_verification_token: null,
          email_verification_expires: null,
          gsm_network: 'mtn',
          phone_number: '08011110001',
          state: 'Lagos',
          pcn_number: 'PCN-S1',
          country: 'Nigeria',
          place_of_work: 'Student Campus',
          professional_cadre: 'pharmacy student',
          others: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: instructorId,
          first_name: 'Test',
          last_name: 'Instructor',
          email: 'instructor.seed@test.com',
          password: instructorPasswordHash,
          role: 'instructor',
          instructor_status: 'approved',
          is_email_verified: true,
          email_verification_token: null,
          email_verification_expires: null,
          gsm_network: 'glo',
          phone_number: '08011110002',
          state: 'Federal Capital Territory',
          pcn_number: 'PCN-I1',
          country: 'Nigeria',
          place_of_work: 'Teaching Hospital',
          professional_cadre: 'hospital pharmacist',
          others: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: adminId,
          first_name: 'Test',
          last_name: 'Admin',
          email: 'admin.seed@test.com',
          password: adminPasswordHash,
          role: 'admin',
          instructor_status: null,
          is_email_verified: true,
          email_verification_token: null,
          email_verification_expires: null,
          gsm_network: 'airtel',
          phone_number: '08011110003',
          state: 'Rivers',
          pcn_number: 'PCN-A1',
          country: 'Nigeria',
          place_of_work: 'Admin Office',
          professional_cadre: 'administrative pharmacist',
          others: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: superAdminId,
          first_name: 'Super',
          last_name: 'Admin',
          email: 'superadmin.seed@test.com',
          password: superAdminPasswordHash,
          role: 'admin',
          instructor_status: null,
          is_email_verified: true,
          email_verification_token: null,
          email_verification_expires: null,
          gsm_network: '9mobile',
          phone_number: '08011110004',
          state: 'Kano',
          pcn_number: 'PCN-SA1',
          country: 'Nigeria',
          place_of_work: 'Main Office',
          professional_cadre: 'administrative pharmacist',
          others: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );

    // --- Seed Admins Table ---
    await queryInterface.bulkInsert(
      'admins',
      [
        {
          id: uuidv4(),
          user_id: adminId,
          job_title: 'Platform Administrator',
          is_super_admin: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          user_id: superAdminId,
          job_title: 'Chief Platform Officer',
          is_super_admin: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', null, {});
    await queryInterface.bulkDelete('users', {
      email: [
        'student.seed@test.com',
        'instructor.seed@test.com',
        'admin.seed@test.com',
        'superadmin.seed@test.com',
      ],
    });
  },
};
