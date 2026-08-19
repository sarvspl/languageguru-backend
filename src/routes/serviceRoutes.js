const express = require('express');
const { getServices, getAllServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getServices);
router.get('/all', protect, getAllServices);
router.post('/', protect, createService);
router.put('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;
