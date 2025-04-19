// backend/controllers/productController.js
import asyncHandler from 'express-async-handler'
import Product from '../models/Product.js'
import mongoose from 'mongoose'
import cloudinary from '../utils/cloudinary.js'

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

// @desc   Lấy một sản phẩm theo ID
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

// @desc   Xóa sản phẩm
// @route  DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log('Attempting to delete product with ID:', id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error('Invalid ID format:', id);
    res.status(400);
    throw new Error('ID sản phẩm không hợp lệ');
  }

  try {
    const product = await Product.findById(id);
    if (product) {
      // Xóa tài liệu liên quan (nếu có)
      await Review.deleteMany({ product: id }); // Bật nếu có model Review
      await Product.deleteOne({ _id: id });
      console.log('Product deleted:', id);
      res.json({ message: 'Đã xóa sản phẩm' });
    } else {
      console.error('Product not found for ID:', id);
      res.status(404);
      throw new Error('Không tìm thấy sản phẩm');
    }
  } catch (error) {
    console.error('Delete product error:', error.message);
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: error.message });
  }
});

// @desc   Tạo sản phẩm
// @route  POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Tên sản phẩm',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Thương hiệu',
    category: 'Danh mục',
    countInStock: 0,
    numReviews: 0,
    description: 'Mô tả sản phẩm'
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
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;
    if (barcode) product.barcode = barcode;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }
});

export { 
  getProducts, 
  getProductById, 
  deleteProduct, 
  createProduct, 
  updateProduct 
};