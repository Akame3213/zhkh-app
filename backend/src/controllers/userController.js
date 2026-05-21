const { User } = require('../models');
const bcrypt = require('bcryptjs');

const getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
};

const getOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения пользователя' });
  }
};

const update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    // Only admin can change roles
    if (req.body.role && req.user.role !== 'admin') {
      delete req.body.role;
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12);
    }

    await user.update(req.body);
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления пользователя' });
  }
};

const toggleActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'Нельзя заблокировать себя' });

    await user.update({ isActive: !user.isActive });
    res.json({ id: user.id, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка изменения статуса' });
  }
};

module.exports = { getAll, getOne, update, toggleActive };
