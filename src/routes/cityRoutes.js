const express = require('express');
const { getCities, getAllCities, createCity, updateCity, deleteCity } = require('../controllers/cityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCities);
router.get('/all', protect, getAllCities);
router.post('/', protect, createCity);
router.put('/:id', protect, updateCity);
router.delete('/:id', protect, deleteCity);

module.exports = router;
