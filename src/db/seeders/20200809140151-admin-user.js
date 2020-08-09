'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // Add seed commands here.

    await queryInterface.bulkInsert('users', [{
      name: 'Admin',
      role: 'Admin',
      email: 'Admin@example.com',
      // Password: Admin@123
      hashedPassword: '$2b$10$eePGcksF9R4v1UtKZU.24uCyMJNGfissmHELZg.dXS.e0pDFkNdxS',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

  },

  down: async (queryInterface, Sequelize) => {

    // Add commands to revert seed here.
    await queryInterface.bulkDelete('users', null, {});
  }
};
