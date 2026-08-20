import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes - only authenticated users can access.
 */
export async function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from db (exclude password)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({ success: false, message: 'User no longer exists' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(`Auth Error: ${error.message}`);
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
}
