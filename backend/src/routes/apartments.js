const express = require('express');
const { body } = require('express-validator');
const { getAll, getOne, create, update, remove } = require('../controllers/apartmentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getAll);
router.get('/:id', getOne);

router.post('/', authorize('admin', 'manager'), [
  body('address').trim().notEmpty().withMessage('Адрес обязателен'),
  body('apartmentNumber').trim().notEmpty().withMessage('Номер квартиры обязателен'),
], create);

router.put('/:id', authorize('admin', 'manager'), [
  body('address').optional().trim().notEmpty(),
], update);

router.delete('/:id', authorize('admin'), remove);

module.exports = router;
