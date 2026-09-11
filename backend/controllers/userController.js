import { User } from '../models/User.js';
import { isStrongPassword } from './authController.js';

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'Employee' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching employee list', error: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, department, designation } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Employee name is required' });
    }

    if (!email || !isValidEmail(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Enforce Strong Password Policy
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Strong password policy violation: Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&#_-).',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Registration failed: Email address is already in use' });
    }

    const employee = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'Employee',
      department: department ? department.trim() : 'Engineering',
      designation: designation ? designation.trim() : 'Software Engineer',
    });

    res.status(201).json({
      success: true,
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      designation: employee.designation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error registering employee', error: error.message });
  }
};
