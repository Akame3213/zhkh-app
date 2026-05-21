const express = require('express');
const { getAll, getOne, update, toggleActive } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin', 'manager'), getAll);
router.get('/:id', authorize('admin', 'manager'), getOne);
router.put('/:id', authorize('admin', 'manager'), update);
router.patch('/:id/toggle', authorize('admin'), toggleActive);

module.exports = router;
