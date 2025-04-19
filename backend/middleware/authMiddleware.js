const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'abc123');
      console.log('Decoded token ID:', decoded.id); // Debug
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        console.error('User not found for ID:', decoded.id);
        res.status(401);
        throw new Error('Không được phép truy cập, user không tồn tại');
      }
      console.log('Authenticated user:', req.user._id); // Debug
      next();
    } catch (error) {
      console.error('Token error:', error.message);
      res.status(401);
      throw new Error('Không được phép truy cập, token không hợp lệ');
    }
  } else {
    console.error('No token provided');
    res.status(401);
    throw new Error('Không được phép truy cập, không có token');
  }
});

const admin = asyncHandler(async (req, res, next) => {
  console.log('Checking admin access for user:', req.user ? req.user._id : 'No user');
  if (req.user && req.user.isAdmin) {
    console.log('Admin access granted');
    next();
  } else {
    console.error('Admin access denied');
    res.status(401);
    throw new Error('Không được phép truy cập, yêu cầu quyền quản trị');
  }
});

module.exports = { protect, admin };