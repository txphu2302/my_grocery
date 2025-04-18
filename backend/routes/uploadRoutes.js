// In backend/routes/uploadRoutes.js
import path from 'path'
import express from 'express'
import multer from 'multer'

const router = express.Router()

// Configure storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  },
})

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb('Chỉ chấp nhận hình ảnh!')
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  },
})

router.post('/', upload.single('image'), (req, res) => {
  // Convert Windows backslashes to forward slashes for web URLs
  const filePath = req.file.path.replace(/\\/g, '/')
  res.send(`/${filePath}`)
})

export default router