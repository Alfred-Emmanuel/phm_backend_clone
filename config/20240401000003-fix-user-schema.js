'use strict';

const GsmNetwork = {
  MTN: 'mtn',
  AIRTEL: 'airtel',
  GLO: 'glo',
  NINE_MOBILE: '9mobile',
};

const Profession = {
  COMMUNITY_PHARMACIST: 'community pharmacist',
  HOSPITAL_PHARMACIST: 'hospital pharmacist',
  ACADEMIC_PHARMACIST: 'academic pharmacist',
  ADMINISTRATIVE_PHARMACIST: 'administrative pharmacist',
  INDUSTRIAL_PHARMACIST: 'industrial pharmacist',
  COUNTER_ASSISTANT: 'counter assistant',
  PHARMACY_STUDENT: 'pharmacy student',
  OTHERS: 'others',
};

const NigerianStates = {
  ABIA: 'Abia',
  ADAMAWA: 'Adamawa',
  AKWA_IBOM: 'Akwa Ibom',
  ANAMBRA: 'Anambra',
  BAUCHI: 'Bauchi',
  BAYELSA: 'Bayelsa',
  BENUE: 'Benue',
  BORNO: 'Borno',
  CROSS_RIVER: 'Cross River',
  DELTA: 'Delta',
  EBONYI: 'Ebonyi',
  EDO: 'Edo',
  EKITI: 'Ekiti',
  ENUGU: 'Enugu',
  FCT: 'Federal Capital Territory',
  GOMBE: 'Gombe',
  IMO: 'Imo',
  JIGAWA: 'Jigawa',
  KADUNA: 'Kaduna',
  KANO: 'Kano',
  KATSINA: 'Katsina',
  KEBBI: 'Kebbi',
  KOGI: 'Kogi',
  KWARA: 'Kwara',
  LAGOS: 'Lagos',
  NASARAWA: 'Nasarawa',
  NIGER: 'Niger',
  OGUN: 'Ogun',
  ONDO: 'Ondo',
  OSUN: 'Osun',
  OYO: 'Oyo',
  PLATEAU: 'Plateau',
  RIVERS: 'Rivers',
  SOKOTO: 'Sokoto',
  TARABA: 'Taraba',
  YOBE: 'Yobe',
  ZAMFARA: 'Zamfara',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Create ENUM types
      await queryInterface.sequelize.query(
        `DO $$ BEGIN
          CREATE TYPE "enum_users_gsm_network" AS ENUM (${Object.values(
            GsmNetwork,
          )
            .map((value) => `'${value}'`)
            .join(', ')});
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;`,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `DO $$ BEGIN
          CREATE TYPE "enum_users_professional_cadre" AS ENUM (${Object.values(
            Profession,
          )
            .map((value) => `'${value}'`)
            .join(', ')});
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;`,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `DO $$ BEGIN
          CREATE TYPE "enum_users_state" AS ENUM (${Object.values(
            NigerianStates,
          )
            .map((value) => `'${value}'`)
            .join(', ')});
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;`,
        { transaction },
      );

      // Add all missing columns
      const columns = [
        {
          name: 'gsm_network',
          type: Sequelize.ENUM(...Object.values(GsmNetwork)),
          allowNull: false,
        },
        { name: 'phone_number', type: Sequelize.STRING, allowNull: false },
        { name: 'pcn_number', type: Sequelize.STRING, allowNull: false },
        { name: 'place_of_work', type: Sequelize.TEXT, allowNull: false },
        {
          name: 'state',
          type: Sequelize.ENUM(...Object.values(NigerianStates)),
          allowNull: true,
        },
        { name: 'country', type: Sequelize.STRING, allowNull: true },
        {
          name: 'professional_cadre',
          type: Sequelize.ENUM(...Object.values(Profession)),
          allowNull: false,
        },
        { name: 'others', type: Sequelize.TEXT, allowNull: true },
        {
          name: 'role',
          type: Sequelize.ENUM('student', 'instructor', 'admin'),
          allowNull: false,
          defaultValue: 'student',
        },
        {
          name: 'instructor_status',
          type: Sequelize.ENUM('pending', 'approved', 'rejected'),
          allowNull: true,
        },
        {
          name: 'is_email_verified',
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        {
          name: 'email_verification_token',
          type: Sequelize.STRING,
          allowNull: true,
        },
        {
          name: 'email_verification_expires',
          type: Sequelize.DATE,
          allowNull: true,
        },
        {
          name: 'status',
          type: Sequelize.ENUM(
            'active',
            'suspended',
            'pending_email_verification',
          ),
          allowNull: false,
          defaultValue: 'pending_email_verification',
        },
        {
          name: 'granted_admin_by',
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
      ];

      for (const column of columns) {
        try {
          await queryInterface.addColumn('users', column.name, column, {
            transaction,
          });
        } catch (error) {
          if (!error.message.includes('already exists')) {
            throw error;
          }
        }
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
      // Remove all columns
      const columns = [
        'gsm_network',
        'phone_number',
        'pcn_number',
        'place_of_work',
        'state',
        'country',
        'professional_cadre',
        'others',
        'role',
        'instructor_status',
        'is_email_verified',
        'email_verification_token',
        'email_verification_expires',
        'status',
        'granted_admin_by',
      ];

      for (const column of columns) {
        try {
          await queryInterface.removeColumn('users', column, { transaction });
        } catch (error) {
          if (!error.message.includes('does not exist')) {
            throw error;
          }
        }
      }

      // Drop ENUM types
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_users_gsm_network";',
        { transaction },
      );
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_users_professional_cadre";',
        { transaction },
      );
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_users_state";',
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
