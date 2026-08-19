const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getClients,
  getAllClients,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clientController');

const router = express.Router();

// Public route
router.get('/', getClients);

// Admin routes
router.get('/all', protect, getAllClients);
router.post('/', protect, createClient);
router.put('/:id', protect, updateClient);
router.delete('/:id', protect, deleteClient);

module.exports = router;
