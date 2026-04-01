const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    billId: {
      type: String, default: '', trim: true, index: true,
    },
    billName: {
      type: String, default: '', trim: true,
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than 0'],
    },
    date: {
      type: Date,
      default: () => new Date(),
    },
    time: {
      type: String,
      default: () => {
        const now = new Date();
        return now.toTimeString().slice(0, 5);
      },
    },
    customerName: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Entry', entrySchema);
