const express = require('express');
const { getHomeSections, getHomeSectionById, createHomeSection, updateHomeSection, deleteHomeSection, reorderHomeSections } = require('../controllers/homeSectionController');
const { verifyAdminToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', getHomeSections);
router.get('/:id', getHomeSectionById);

router.post('/', verifyAdminToken, createHomeSection);
router.put('/reorder', verifyAdminToken, reorderHomeSections);
router.put('/:id', verifyAdminToken, updateHomeSection);
router.delete('/:id', verifyAdminToken, deleteHomeSection);

module.exports = router;
