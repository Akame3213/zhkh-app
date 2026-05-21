const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MeterReading = sequelize.define('MeterReading', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    value: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      validate: { min: 0 },
    },
    previousValue: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: true,
    },
    consumption: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: true,
    },
    readingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    submittedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    meterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'meters', key: 'id' },
    },
  }, {
    tableName: 'meter_readings',
    timestamps: true,
  });

  return MeterReading;
};
