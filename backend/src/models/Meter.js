const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Meter = sequelize.define('Meter', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serialNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('cold_water', 'hot_water', 'electricity', 'gas', 'heat'),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'м³',
    },
    tariff: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
    },
    installedAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nextCheckDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    apartmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'apartments', key: 'id' },
    },
  }, {
    tableName: 'meters',
    timestamps: true,
  });

  return Meter;
};
