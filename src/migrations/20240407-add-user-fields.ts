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
      // Add GSM Network enum type
      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_users_gsmNetwork" AS ENUM (${Object.values(
          GsmNetwork,
        )
          .map((value) => `'${value}'`)
          .join(', ')});`,
        { transaction },
      );

      // Add Professional Cadre enum type
      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_users_professionalCadre" AS ENUM (${Object.values(
          Profession,
        )
          .map((value) => `'${value}'`)
          .join(', ')});`,
        { transaction },
      );

      // Add new columns
      await queryInterface.addColumn(
        'users',
        'gsmNetwork',
        {
          type: Sequelize.ENUM(...Object.values(GsmNetwork)),
          allowNull: false,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'users',
        'phoneNumber',
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'users',
        'pcnNumber',
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'users',
        'placeOfWork',
        {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'users',
        'state',
        {
          type: Sequelize.ENUM(...Object.values(NigerianStates)),
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'users',
        'country',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'users',
        'professionalCadre',
        {
          type: Sequelize.ENUM(...Object.values(Profession)),
          allowNull: false,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'users',
        'others',
        {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove columns
      await queryInterface.removeColumn('users', 'gsmNetwork', {
        transaction,
      });
      await queryInterface.removeColumn('users', 'phoneNumber', {
        transaction,
      });
      await queryInterface.removeColumn('users', 'pcnNumber', { transaction });
      await queryInterface.removeColumn('users', 'placeOfWork', {
        transaction,
      });
      await queryInterface.removeColumn('users', 'state', { transaction });
      await queryInterface.removeColumn('users', 'country', { transaction });
      await queryInterface.removeColumn('users', 'professionalCadre', {
        transaction,
      });
      await queryInterface.removeColumn('users', 'others', { transaction });

      // Drop enum types
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_users_gsmNetwork";',
        { transaction },
      );
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_users_professionalCadre";',
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
