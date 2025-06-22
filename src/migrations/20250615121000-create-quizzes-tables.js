module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure pgcrypto extension is enabled for gen_random_uuid()
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "pgcrypto";',
    );

    await queryInterface.createTable('quizzes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        field: 'id',
      },
      course_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE',
        field: 'course_id',
      },
      position: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'position',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    });

    await queryInterface.createTable('quiz_questions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        field: 'id',
      },
      quiz_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'quizzes', key: 'id' },
        onDelete: 'CASCADE',
        field: 'quiz_id',
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: 'question',
      },
      options: {
        type: Sequelize.JSONB,
        allowNull: false,
        field: 'options',
      },
      correct_answer: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'correct_answer',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    });

    await queryInterface.createTable('quiz_attempts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        field: 'id',
      },
      quiz_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'quizzes', key: 'id' },
        onDelete: 'CASCADE',
        field: 'quiz_id',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        field: 'user_id',
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'score',
      },
      passed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        field: 'passed',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    });

    await queryInterface.createTable('quiz_answers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        field: 'id',
      },
      attempt_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'quiz_attempts', key: 'id' },
        onDelete: 'CASCADE',
        field: 'attempt_id',
      },
      question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'quiz_questions', key: 'id' },
        onDelete: 'CASCADE',
        field: 'question_id',
      },
      answer: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'answer',
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        field: 'is_correct',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('quiz_answers');
    await queryInterface.dropTable('quiz_attempts');
    await queryInterface.dropTable('quiz_questions');
    await queryInterface.dropTable('quizzes');
  },
};
