const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'zhkh_db',
  process.env.DB_USER || 'zhkh_user',
  process.env.DB_PASSWORD || 'zhkh_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

const User = require('./User')(sequelize);
const Apartment = require('./Apartment')(sequelize);
const Meter = require('./Meter')(sequelize);
const MeterReading = require('./MeterReading')(sequelize);
const Bill = require('./Bill')(sequelize);

// Associations
User.hasMany(Apartment, { foreignKey: 'userId', as: 'apartments' });
Apartment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Apartment.hasMany(Meter, { foreignKey: 'apartmentId', as: 'meters' });
Meter.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' });

Meter.hasMany(MeterReading, { foreignKey: 'meterId', as: 'readings' });
MeterReading.belongsTo(Meter, { foreignKey: 'meterId', as: 'meter' });

Apartment.hasMany(Bill, { foreignKey: 'apartmentId', as: 'bills' });
Bill.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' });

module.exports = { sequelize, User, Apartment, Meter, MeterReading, Bill };
