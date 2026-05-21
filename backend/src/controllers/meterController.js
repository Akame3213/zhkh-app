const { validationResult } = require('express-validator');
const { Meter, Apartment, MeterReading } = require('../models');

const METER_UNITS = {
  cold_water: 'м³',
  hot_water: 'м³',
  electricity: 'кВт·ч',
  gas: 'м³',
  heat: 'Гкал',
};

const getAll = async (req, res) => {
  try {
    const { apartmentId } = req.query;
    let where = {};
    if (apartmentId) where.apartmentId = apartmentId;

    const meters = await Meter.findAll({
      where,
      include: [{ model: Apartment, as: 'apartment' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(meters);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения счётчиков' });
  }
};

const getOne = async (req, res) => {
  try {
    const meter = await Meter.findByPk(req.params.id, {
      include: [
        { model: Apartment, as: 'apartment' },
        { model: MeterReading, as: 'readings', order: [['readingDate', 'DESC']], limit: 12 },
      ],
    });
    if (!meter) return res.status(404).json({ error: 'Счётчик не найден' });
    res.json(meter);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения счётчика' });
  }
};

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { type } = req.body;
    const unit = METER_UNITS[type] || 'ед.';
    const meter = await Meter.create({ ...req.body, unit });
    res.status(201).json(meter);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Счётчик с таким серийным номером уже существует' });
    }
    res.status(500).json({ error: 'Ошибка создания счётчика' });
  }
};

const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const meter = await Meter.findByPk(req.params.id);
    if (!meter) return res.status(404).json({ error: 'Счётчик не найден' });

    await meter.update(req.body);
    res.json(meter);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления счётчика' });
  }
};

const remove = async (req, res) => {
  try {
    const meter = await Meter.findByPk(req.params.id);
    if (!meter) return res.status(404).json({ error: 'Счётчик не найден' });

    await meter.destroy();
    res.json({ message: 'Счётчик удалён' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления счётчика' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
