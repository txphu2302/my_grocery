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
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    
    if (product) {
      // Xóa ảnh trên Cloudinary nếu ảnh từ Cloudinary
      if (product.image && product.image.includes('cloudinary')) {
        try {
          // Lấy public_id từ URL
          const splittedUrl = product.image.split('/');
          const folderWithPublicId = splittedUrl[splittedUrl.length - 2] + '/' + 
                                    splittedUrl[splittedUrl.length - 1].split('.')[0];
          
          console.log('Attempting to delete image:', folderWithPublicId);
          
          // Xóa ảnh từ Cloudinary (không chặn quá trình xóa sản phẩm)
          cloudinary.uploader.destroy(folderWithPublicId)
            .then(result => console.log('Cloudinary delete result:', result))
            .catch(err => console.error('Failed to delete from Cloudinary:', err));
        } catch (cloudinaryError) {
          console.error('Error parsing Cloudinary URL:', cloudinaryError);
          // Không dừng quá trình xóa sản phẩm nếu không xóa được ảnh
        }
      }
      
      // Xóa reviews nếu có model Review
      try {
        // Kiểm tra tồn tại model Review trước khi xóa
        const mongoose = require('mongoose');
        if (mongoose.modelNames().includes('Review')) {
          const Review = mongoose.model('Review');
          await Review.deleteMany({ product: id });
          console.log('Related reviews deleted');
        }
      } catch (reviewError) {
        console.error('Error while deleting reviews:', reviewError);
        // Tiếp tục xóa sản phẩm ngay cả khi không xóa được reviews
      }

      // Xóa sản phẩm
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


const createProduct = asyncHandler(async (req, res) => {
  const { name, price, image, brand, category, countInStock, description, barcode, units } = req.body;

  const product = new Product({
    name: name || 'Tên sản phẩm',
    price: price || 0,
    user: req.user._id,
    image: image || '/images/sample.jpg',
    brand: brand || 'Thương hiệu',
    category: category || 'Danh mục',
    countInStock: countInStock || 0,
    numReviews: 0,
    description: description || 'Mô tả sản phẩm',
    barcode: barcode || `PROD${Date.now()}`,
    units: units || [{ name: 'Sản phẩm', ratio: 1, price: price || 0, description: '', isDefault: true }], // Default unit
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
    barcode,
    units // Add units to destructuring
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
    if (units) product.units = units; // Update units field

    const updatedProduct = await product.save();
    console.log('Updated product with units:', updatedProduct.units); // Log to verify
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