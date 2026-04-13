const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    buyPrice: {
      type: Number,
      default: 0,
      min: [0, 'Buy price cannot be negative'],
    },
    crateSize: {
      type: Number,
      default: 1,
      min: [1, 'Crate size must be at least 1'],
    },
    unit: {
      type: String,
      enum: [
        '0.17 Litre',
        '0.2 Litre',
        '0.25 Litre',
        '0.48 Litre',
        '0.5 Litre',
        '1 Litre',
        '6 Litre',
        '0.4 kg',
        '5 kg',
        'kg',
        'packet',
        'piece',
      ],
      default: '1 Litre',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
