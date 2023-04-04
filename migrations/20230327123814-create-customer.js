'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Customers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fullname: {
        type: Sequelize.STRING
      },
      room_no: {
        type: Sequelize.STRING
      },
      phonenumber: {
        type: Sequelize.INTEGER
      },
      costpernight: {
        type: Sequelize.INTEGER
      },
      payed: {
        type: Sequelize.INTEGER
      },
      owed: {
        type: Sequelize.INTEGER
      },
      total_cost: {
        type: Sequelize.INTEGER
      },
      customer_status: {
        type:Sequelize.TINYINT,
        allowNull:false
      },
      checkout: {
        allowNull: false,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Customers');
  }
};