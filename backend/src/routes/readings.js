const express = require('express');
const { body } = require('express-validator');
const { getAll, create, update, remove } = require('../controllers/readingController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getAll);

router.post('/', [
  body('meterId').isInt().withMessage('ID счётчика обязателен'),
  body('value').isFloat({ min: 0 }).withMessage('Показание должно быть неотрицательным числом'),
  body('readingDate').isDate().withMessage('Дата обязательна'),
], create);

router.put('/:id', authorize('admin', 'manager'), [
  body('value').optional().isFloat({ min: 0 }),
], update);

router.delete('/:id', authorize('admin', 'manager'), remove);

module.exports = router;
