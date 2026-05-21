const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Apartment = sequelize.define('Apartment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    apartmentNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    floor: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    area: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    residents: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  }, {
    tableName: 'apartments',
    timestamps: true,
  });

  return Apartment;
};
