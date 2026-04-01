const express = require('express');
const router = express.Router();
const {
  getAllEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  updateBillStatus,
} = require('../controllers/entryController');

const { protect } = require('../middleware/auth');

router.get('/', protect, getAllEntries);
router.post('/', protect, createEntry);
router.put('/:id', protect, updateEntry);
router.delete('/:id', protect, deleteEntry);
router.put('/bill/:billId/status', protect, updateBillStatus);

module.exports = router;
