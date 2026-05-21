const { validationResult } = require('express-validator');
const { Bill, Apartment, MeterReading, Meter } = require('../models');
const { broadcast } = require('../websocket/wsServer');

const getAll = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'resident') {
      const apartments = await Apartment.findAll({ where: { userId: req.user.id } });
      const ids = apartments.map(a => a.id);
      where.apartmentId = ids;
    }
    const bills = await Bill.findAll({
      where,
      include: [{ model: Apartment, as: 'apartment' }],
      order: [['period', 'DESC']],
    });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения счетов' });
  }
};

const generate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { apartmentId, period } = req.body;

    const existing = await Bill.findOne({ where: { apartmentId, period } });
    if (existing) return res.status(409).json({ error: 'Счёт за этот период уже существует' });

    const meters = await Meter.findAll({
      where: { apartmentId, isActive: true },
      include: [{
        model: MeterReading,
        as: 'readings',
        where: {
          readingDate: { [require('sequelize').Op.like]: `${period}%` }
        },
        required: false,
        limit: 1,
        order: [['readingDate', 'DESC']],
      }],
    });

    const amounts = {
      coldWaterAmount: 0,
      hotWaterAmount: 0,
      electricityAmount: 0,
      gasAmount: 0,
      heatAmount: 0,
    };

    for (const meter of meters) {
      const reading = meter.readings?.[0];
      if (reading) {
        const cost = parseFloat(reading.consumption || 0) * parseFloat(meter.tariff);
        switch (meter.type) {
          case 'cold_water': amounts.coldWaterAmount += cost; break;
          case 'hot_water': amounts.hotWaterAmount += cost; break;
          case 'electricity': amounts.electricityAmount += cost; break;
          case 'gas': amounts.gasAmount += cost; break;
          case 'heat': amounts.heatAmount += cost; break;
        }
      }
    }

    const totalAmount = Object.values(amounts).reduce((s, v) => s + v, 0);

    const bill = await Bill.create({ apartmentId, period, totalAmount, ...amounts });

    broadcast({ type: 'NEW_BILL', data: { bill } });

    res.status(201).json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка генерации счёта' });
  }
};

const pay = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Счёт не найден' });
    if (bill.status === 'paid') return res.status(400).json({ error: 'Счёт уже оплачен' });

    await bill.update({ status: 'paid', paidAt: new Date() });

    broadcast({ type: 'BILL_PAID', data: { billId: bill.id, apartmentId: bill.apartmentId } });

    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка оплаты счёта' });
  }
};

const remove = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Счёт не найден' });
    await bill.destroy();
    res.json({ message: 'Счёт удалён' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления счёта' });
  }
};

module.exports = { getAll, generate, pay, remove };
