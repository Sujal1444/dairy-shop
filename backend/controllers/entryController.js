const mongoose = require('mongoose');
const Entry = require('../models/Entry');

// GET /api/entries?date=YYYY-MM-DD
const getAllEntries = async (req, res) => {
  try {
    let query = { user: req.user.id };
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(req.query.date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }
    const entries = await Entry.find(query)
      .populate('productId', 'name price unit category')
      .sort({ date: -1, createdAt: -1 });
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/entries
const createEntry = async (req, res) => {
  try {
    const { productId, quantity, date, time, customerName, billId, billName } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product is required' });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
    }
    const entry = new Entry({ productId, quantity, date, time, customerName, billId, billName, user: req.user.id });
    await entry.save();
    await entry.populate('productId', 'name price unit category');
    res.status(201).json({ success: true, data: entry, message: 'Entry added successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/entries/:id
const updateEntry = async (req, res) => {
  try {
    let entry = await Entry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    if (entry.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this entry' });
    }

    entry = await Entry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('productId', 'name price unit category');
    res.json({ success: true, data: entry, message: 'Entry updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/entries/:id
const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    if (entry.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this entry' });
    }

    await Entry.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/entries/bill/:billId/status
const updateBillStatus = async (req, res) => {
  try {
    const { billId } = req.params;
    const { status } = req.body;
    if (!['unpaid', 'paid'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const result = await Entry.updateMany(
      { user: req.user.id, $or: [{ billId }, { _id: mongoose.isValidObjectId(billId) ? billId : null }] },
      { status }
    );
    res.json({
      success: true,
      message: `Bill status updated to ${status}`,
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllEntries, createEntry, updateEntry, deleteEntry, updateBillStatus };
