const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Middleware bảo vệ route, yêu cầu token hợp lệ
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'abc123');

      // Lấy thông tin user từ token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Không được phép truy cập, token không hợp lệ');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Không được phép truy cập, không có token');
  }
});

// Middleware kiểm tra quyền admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Không được phép truy cập, yêu cầu quyền quản trị');
  }
};

module.exports = { protect, admin };