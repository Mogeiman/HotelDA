'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
    
  }
  Room.init({

    room_no: {
      type: DataTypes.STRING,
      allowNull: false
    },
    room_status: {
      type:DataTypes.TINYINT,
      allowNull:false
    },
    room_price: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Room',
    freezeTableName: true, // this option will prevent Sequelize from automatically pluralizing the table name

  });
  return Room;
};