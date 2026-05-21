require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Apartment, Meter, MeterReading, Bill } = require('./models');

async function seed() {
  await sequelize.sync({ force: true });
  console.log('✅ База данных очищена');

  // Users
  const adminPass = await bcrypt.hash('admin123', 12);
  const managerPass = await bcrypt.hash('manager123', 12);
  const residentPass = await bcrypt.hash('resident123', 12);

  const admin = await User.create({
    name: 'Администратор', email: 'admin@zhkh.ru', password: adminPass, role: 'admin', phone: '+7-900-000-0001',
  });
  const manager = await User.create({
    name: 'Иванов Сергей', email: 'manager@zhkh.ru', password: managerPass, role: 'manager', phone: '+7-900-000-0002',
  });
  const resident1 = await User.create({
    name: 'Петрова Анна', email: 'anna@mail.ru', password: residentPass, role: 'resident', phone: '+7-900-111-2233',
  });
  const resident2 = await User.create({
    name: 'Козлов Дмитрий', email: 'dmitry@mail.ru', password: residentPass, role: 'resident', phone: '+7-900-444-5566',
  });

  console.log('✅ Пользователи созданы');

  // Apartments
  const apt1 = await Apartment.create({
    address: 'ул. Ленина, д. 15', apartmentNumber: '47', floor: 5, area: 65.5, residents: 3, userId: resident1.id,
  });
  const apt2 = await Apartment.create({
    address: 'пр. Мира, д. 22', apartmentNumber: '12', floor: 2, area: 42.0, residents: 2, userId: resident2.id,
  });
  const apt3 = await Apartment.create({
    address: 'ул. Садовая, д. 8', apartmentNumber: '3', floor: 1, area: 80.0, residents: 4, userId: null,
  });

  console.log('✅ Квартиры созданы');

  // Meters
  const meters = await Meter.bulkCreate([
    { serialNumber: 'HW-2024-001', type: 'hot_water', unit: 'м³', tariff: 180.50, apartmentId: apt1.id, installedAt: '2022-01-15', nextCheckDate: '2027-01-15' },
    { serialNumber: 'CW-2024-001', type: 'cold_water', unit: 'м³', tariff: 42.30, apartmentId: apt1.id, installedAt: '2022-01-15', nextCheckDate: '2027-01-15' },
    { serialNumber: 'EL-2024-001', type: 'electricity', unit: 'кВт·ч', tariff: 5.70, apartmentId: apt1.id, installedAt: '2021-06-01', nextCheckDate: '2026-06-01' },
    { serialNumber: 'GS-2024-001', type: 'gas', unit: 'м³', tariff: 7.90, apartmentId: apt1.id, installedAt: '2022-03-10', nextCheckDate: '2027-03-10' },
    { serialNumber: 'HW-2024-002', type: 'hot_water', unit: 'м³', tariff: 180.50, apartmentId: apt2.id, installedAt: '2023-05-20', nextCheckDate: '2028-05-20' },
    { serialNumber: 'CW-2024-002', type: 'cold_water', unit: 'м³', tariff: 42.30, apartmentId: apt2.id, installedAt: '2023-05-20', nextCheckDate: '2028-05-20' },
    { serialNumber: 'EL-2024-002', type: 'electricity', unit: 'кВт·ч', tariff: 5.70, apartmentId: apt2.id, installedAt: '2023-01-01', nextCheckDate: '2028-01-01' },
    { serialNumber: 'HT-2024-001', type: 'heat', unit: 'Гкал', tariff: 2150.00, apartmentId: apt3.id, installedAt: '2020-09-01', nextCheckDate: '2025-09-01' },
  ]);

  console.log('✅ Счётчики созданы');

  // Readings (last 3 months)
  const months = ['2025-01', '2025-02', '2025-03'];
  let baseValues = {};
  meters.forEach(m => { baseValues[m.id] = 100 + Math.random() * 500; });

  for (const period of months) {
    for (const meter of meters) {
      const prevVal = baseValues[meter.id];
      const consumption = (meter.type === 'electricity') ? 80 + Math.random() * 120 : 2 + Math.random() * 8;
      const newVal = prevVal + consumption;
      await MeterReading.create({
        meterId: meter.id,
        value: parseFloat(newVal.toFixed(3)),
        previousValue: parseFloat(prevVal.toFixed(3)),
        consumption: parseFloat(consumption.toFixed(3)),
        readingDate: `${period}-25`,
        submittedBy: admin.id,
      });
      baseValues[meter.id] = newVal;
    }
  }

  console.log('✅ Показания созданы');

  // Bills
  await Bill.bulkCreate([
    { apartmentId: apt1.id, period: '2025-01', totalAmount: 5840.20, coldWaterAmount: 380.70, hotWaterAmount: 1624.50, electricityAmount: 741.00, gasAmount: 94.00, status: 'paid', paidAt: new Date('2025-02-10') },
    { apartmentId: apt1.id, period: '2025-02', totalAmount: 6120.45, coldWaterAmount: 422.10, hotWaterAmount: 1805.00, electricityAmount: 693.00, gasAmount: 100.35, status: 'paid', paidAt: new Date('2025-03-08') },
    { apartmentId: apt1.id, period: '2025-03', totalAmount: 5980.00, coldWaterAmount: 399.50, hotWaterAmount: 1660.60, electricityAmount: 720.00, gasAmount: 99.90, status: 'pending' },
    { apartmentId: apt2.id, period: '2025-01', totalAmount: 3210.80, coldWaterAmount: 296.10, hotWaterAmount: 1264.00, electricityAmount: 570.00, status: 'paid', paidAt: new Date('2025-02-14') },
    { apartmentId: apt2.id, period: '2025-02', totalAmount: 3450.00, coldWaterAmount: 318.00, hotWaterAmount: 1354.00, electricityAmount: 627.00, status: 'overdue' },
    { apartmentId: apt2.id, period: '2025-03', totalAmount: 3390.55, coldWaterAmount: 305.50, hotWaterAmount: 1300.50, electricityAmount: 598.50, status: 'pending' },
  ]);

  console.log('✅ Счета созданы');
  console.log('\n🎉 База данных заполнена тестовыми данными!\n');
  console.log('Тестовые аккаунты:');
  console.log('  Администратор: admin@zhkh.ru / admin123');
  console.log('  Менеджер:      manager@zhkh.ru / manager123');
  console.log('  Жилец 1:       anna@mail.ru / resident123');
  console.log('  Жилец 2:       dmitry@mail.ru / resident123');

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Ошибка сидирования:', err);
  process.exit(1);
});
