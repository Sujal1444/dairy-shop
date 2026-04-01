const Product = require('../models/Product');

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, price, unit, category, buyPrice, crateSize } = req.body;
    if (!name || price === undefined || price === null) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }
    if (price < 0) {
      return res.status(400).json({ success: false, message: 'Price cannot be negative' });
    }
    const product = new Product({ name, price, unit, category, buyPrice, crateSize, user: req.user.id });
    await product.save();
    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this product' });
    }
    await Product.deleteOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct };
