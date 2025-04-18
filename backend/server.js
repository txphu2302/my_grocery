import path from 'path'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import connectDB from './config/db.js'
import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import { errorHandler } from './middleware/errorMiddleware.js'

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

const app = express()

// Define __dirname in ES module
const __dirname = path.resolve()

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure CORS
const corsOptions = {
  origin: ['https://taphoa-anha.vercel.app', 'http://localhost:3000'], // Add your Vercel URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}

// Apply CORS middleware with options
app.use(cors(corsOptions))
app.use(express.json())

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

// Routes
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)

// Test route
app.get('/', (req, res) => {
  res.send('API đang hoạt động...')
})

// Error Middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`)
})