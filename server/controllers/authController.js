import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Generate a JWT token
 */
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
}

/**
 * @desc    Authenticate admin user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export async function loginAdmin(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ success: false, message: 'Please provide username and password' });
    return;
  }

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          username: user.username,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc    Get logged in admin profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export async function getAdminProfile(req, res) {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
