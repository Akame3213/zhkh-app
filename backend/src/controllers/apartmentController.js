const { validationResult } = require('express-validator');
const { Apartment, User, Meter } = require('../models');

const getAll = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'resident') {
      where = { userId: req.user.id };
    }
    const apartments = await Apartment.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Meter, as: 'meters', where: { isActive: true }, required: false },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(apartments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения квартир' });
  }
};

const getOne = async (req, res) => {
  try {
    const apartment = await Apartment.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Meter, as: 'meters' },
      ],
    });
    if (!apartment) return res.status(404).json({ error: 'Квартира не найдена' });

    if (req.user.role === 'resident' && apartment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Нет доступа' });
    }

    res.json(apartment);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения квартиры' });
  }
};

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const apartment = await Apartment.create(req.body);
    res.status(201).json(apartment);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка создания квартиры' });
  }
};

const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const apartment = await Apartment.findByPk(req.params.id);
    if (!apartment) return res.status(404).json({ error: 'Квартира не найдена' });

    await apartment.update(req.body);
    res.json(apartment);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления квартиры' });
  }
};

const remove = async (req, res) => {
  try {
    const apartment = await Apartment.findByPk(req.params.id);
    if (!apartment) return res.status(404).json({ error: 'Квартира не найдена' });

    await apartment.destroy();
    res.json({ message: 'Квартира удалена' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления квартиры' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
