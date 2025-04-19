// backend/routes/uploadRoutes.js
import express from 'express'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../utils/cloudinary.js'

const router = express.Router()

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'taphoaanha', // Thư mục trên Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, crop: 'limit' }] // Tối ưu kích thước ảnh
  }
})

// Init upload middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: function (req, file, cb) {
    // Kiểm tra định dạng file
    if (!file.mimetype.match(/jpg|jpeg|png|webp/)) {
      return cb(new Error('Chỉ chấp nhận file hình ảnh JPG, JPEG, PNG hoặc WebP'), false)
    }
    cb(null, true)
  }
})

// Upload route
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' })
    }
    
    // Cloudinary sẽ trả về URL trực tiếp
    res.send(req.file.path)
  } catch (error) {
    console.error('Lỗi upload:', error)
    res.status(400).json({ message: 'Không thể tải lên hình ảnh: ' + error.message })
  }
})

export default router