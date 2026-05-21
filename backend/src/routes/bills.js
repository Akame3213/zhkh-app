const express = require('express');
const { body } = require('express-validator');
const { getAll, generate, pay, remove } = require('../controllers/billController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getAll);

router.post('/generate', authorize('admin', 'manager'), [
  body('apartmentId').isInt().withMessage('ID квартиры обязателен'),
  body('period').matches(/^\d{4}-\d{2}$/).withMessage('Период в формате YYYY-MM'),
], generate);

router.post('/:id/pay', pay);
router.delete('/:id', authorize('admin'), remove);

module.exports = router;
