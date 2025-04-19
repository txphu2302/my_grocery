const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc   Lấy tất cả sản phẩm
// @route  GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;
  
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc   Lấy sản phẩm theo ID
// @route  GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }
});

// @desc   Thêm sản phẩm mới
// @route  POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, category, countInStock } = req.body;

  const product = new Product({
    name,
    price,
    description,
    image,
    category,
    countInStock,
    rating: 0,
    numReviews: 0,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc   Cập nhật sản phẩm
// @route  PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    countInStock,
    barcode
  } = req.body

  const product = await Product.findById(req.params.id)

  if (product) {
    product.name = name || product.name
    product.price = price !== undefined ? price : product.price
    product.description = description || product.description
    product.image = image || product.image
    product.brand = brand || product.brand
    product.category = category || product.category
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock
    product.barcode = barcode || product.barcode

    try {
      const updatedProduct = await product.save()
      res.json(updatedProduct)
    } catch (error) {
      console.error('Product update error:', error)
      res.status(400).json({
        message: 'Product update failed',
        error: error.message
      })
    }
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc   Xóa sản phẩm
// @route  DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('ID sản phẩm không hợp lệ');
  }

  const product = await Product.findById(id);
  if (product) {
    await Product.deleteOne({ _id: id });
    res.json({ message: 'Đã xóa sản phẩm' });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};