import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Generate JWT with 24-hour expiration
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'mysecretkey12345', {
    expiresIn: '24h',
  });
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Strong Password Validation Regex: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
export const isStrongPassword = (password) => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_-])[A-Za-z\d@$!%*?&#_-]{8,}$/;
  return strongRegex.test(password);
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both email address and password are required',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address format',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: User email not registered',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: Incorrect password',
      });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized access: This account is registered as [${user.role}], not [${role}].`,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error processing login request',
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }
    res.json({ success: true, ...user.toObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};
