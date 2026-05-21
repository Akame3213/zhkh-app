const { validationResult } = require('express-validator');
const { MeterReading, Meter, Apartment } = require('../models');
const { broadcast } = require('../websocket/wsServer');

const getAll = async (req, res) => {
  try {
    const { meterId } = req.query;
    let where = {};
    if (meterId) where.meterId = meterId;

    const readings = await MeterReading.findAll({
      where,
      include: [{ model: Meter, as: 'meter', include: [{ model: Apartment, as: 'apartment' }] }],
      order: [['readingDate', 'DESC']],
    });
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения показаний' });
  }
};

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { meterId, value, readingDate, note } = req.body;

    const meter = await Meter.findByPk(meterId);
    if (!meter) return res.status(404).json({ error: 'Счётчик не найден' });

    // Get last reading
    const lastReading = await MeterReading.findOne({
      where: { meterId },
      order: [['readingDate', 'DESC']],
    });

    const previousValue = lastReading ? parseFloat(lastReading.value) : 0;
    const consumption = parseFloat(value) - previousValue;

    if (consumption < 0) {
      return res.status(400).json({ error: 'Показание не может быть меньше предыдущего' });
    }

    const reading = await MeterReading.create({
      meterId,
      value,
      previousValue,
      consumption,
      readingDate,
      note,
      submittedBy: req.user.id,
    });

    // Broadcast via WebSocket
    broadcast({
      type: 'NEW_READING',
      data: { reading, meterId, consumption },
    });

    res.status(201).json(reading);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сохранения показания' });
  }
};

const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const reading = await MeterReading.findByPk(req.params.id);
    if (!reading) return res.status(404).json({ error: 'Показание не найдено' });

    await reading.update(req.body);
    res.json(reading);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления показания' });
  }
};

const remove = async (req, res) => {
  try {
    const reading = await MeterReading.findByPk(req.params.id);
    if (!reading) return res.status(404).json({ error: 'Показание не найдено' });

    await reading.destroy();
    res.json({ message: 'Показание удалено' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
};

module.exports = { getAll, create, update, remove };
