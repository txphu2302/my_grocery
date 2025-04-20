// models/Product.js
import mongoose from 'mongoose';

// Schema cho đơn vị sản phẩm
const unitSchema = mongoose.Schema({
  name: { type: String, required: true }, // Tên đơn vị (Thùng, Lốc, Lon...)
  ratio: { type: Number, required: true, default: 1 }, // Tỷ lệ quy đổi
  price: { type: Number }, // Giá theo đơn vị (nếu khác với giá gốc)
  image: { type: String }, // Hình ảnh cho đơn vị này
  description: { type: String }, // Mô tả cho đơn vị này (vd: "24 lon x 330ml")
  isDefault: { type: Boolean, default: false }, // Đơn vị mặc định
  inStock: { type: Boolean, default: true } // Có sẵn hay không
});

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true, default: 'Chưa có thương hiệu' },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 }, // Giá sản phẩm
    countInStock: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    barcode: { type: String, sparse: true },
    
    // Giữ lại trường đơn vị sản phẩm
    units: [unitSchema]
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;