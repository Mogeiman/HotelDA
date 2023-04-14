'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {}
  }
  Customer.init(
    {
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      room_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phonenumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      costpernight: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payed: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      owed: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customer_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Customer',
      freezeTableName: true, // this option will prevent Sequelize from automatically pluralizing the table name
      
      // hooks: {
      //   afterUpdate: async (instance, options) => {
      //     console.log('afterUpdate hook called'); // added console.log statement

      //     // Update owed when payed or total_cost is changed
      //     if (instance.payed !== instance._previousDataValues.payed || instance.total_cost !== instance._previousDataValues.total_cost) {
      //       await instance.update({ owed: instance.total_cost - instance.payed }, { silent: true });
      //     }

      //     // Update total_cost when createdAt or checkout is changed
      //     if (instance.createdAt !== instance._previousDataValues.createdAt || instance.checkout !== instance._previousDataValues.checkout) {
      //       const days = Math.ceil((instance.checkout - instance.createdAt) / (1000 * 60 * 60 * 24));
      //       await instance.update({ total_cost: instance.costpernight * days }, { silent: true });
      //     }
      //   },
      // },
    }
  );
  return Customer;
};
