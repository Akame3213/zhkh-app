const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bill = sequelize.define('Bill', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    period: {
      type: DataTypes.STRING(7), // YYYY-MM
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    coldWaterAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    hotWaterAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    electricityAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    gasAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    heatAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'overdue'),
      defaultValue: 'pending',
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    apartmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'apartments', key: 'id' },
    },
  }, {
    tableName: 'bills',
    timestamps: true,
  });

  return Bill;
};
