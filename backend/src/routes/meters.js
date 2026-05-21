const express = require('express');
const { body } = require('express-validator');
const { getAll, getOne, create, update, remove } = require('../controllers/meterController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getAll);
router.get('/:id', getOne);

router.post('/', authorize('admin', 'manager'), [
  body('serialNumber').trim().notEmpty().withMessage('Серийный номер обязателен'),
  body('type').isIn(['cold_water', 'hot_water', 'electricity', 'gas', 'heat']).withMessage('Неверный тип счётчика'),
  body('tariff').isFloat({ min: 0 }).withMessage('Тариф должен быть неотрицательным числом'),
  body('apartmentId').isInt().withMessage('ID квартиры обязателен'),
], create);

router.put('/:id', authorize('admin', 'manager'), [
  body('tariff').optional().isFloat({ min: 0 }).withMessage('Тариф должен быть неотрицательным'),
], update);

router.delete('/:id', authorize('admin'), remove);

module.exports = router;
