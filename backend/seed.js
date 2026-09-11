import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Task } from './models/Task.js';

dotenv.config();

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_management_db';
    console.log(`Connecting to database...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing old data...');
    await User.deleteMany({});
    await Task.deleteMany({});

    console.log('Creating users with strong passwords...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@xplore.com',
      password: 'Admin@12345',
      role: 'Admin',
      department: 'Management',
      designation: 'Project Lead',
    });

    const john = await User.create({
      name: 'John Doe',
      email: 'john@xplore.com',
      password: 'User@12345',
      role: 'Employee',
      department: 'Development',
      designation: 'Frontend Developer',
    });

    const jane = await User.create({
      name: 'Jane Smith',
      email: 'jane@xplore.com',
      password: 'User@12345',
      role: 'Employee',
      department: 'Development',
      designation: 'Backend Developer',
    });

    const alex = await User.create({
      name: 'Alex Johnson',
      email: 'alex@xplore.com',
      password: 'User@12345',
      role: 'Employee',
      department: 'QA',
      designation: 'QA Engineer',
    });

    console.log('Creating sample tasks...');
    await Task.insertMany([
      {
        title: 'Design Dashboard UI',
        description: 'Create responsive layout for task management dashboard',
        assignedEmployee: john._id,
        assignedBy: admin._id,
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date(Date.now() + 86400000 * 3),
      },
      {
        title: 'Implement JWT Auth API',
        description: 'Set up JWT middleware and login endpoints in Express',
        assignedEmployee: jane._id,
        assignedBy: admin._id,
        priority: 'High',
        status: 'Completed',
        dueDate: new Date(Date.now() - 86400000 * 2),
      },
      {
        title: 'Test Email Notifications',
        description: 'Verify Nodemailer dispatch on task assignment and status update',
        assignedEmployee: alex._id,
        assignedBy: admin._id,
        priority: 'Medium',
        status: 'Pending',
        dueDate: new Date(Date.now() + 86400000 * 4),
      },
      {
        title: 'Fix Navigation Bar Alignment',
        description: 'Adjust mobile menu items and profile badge spacing',
        assignedEmployee: john._id,
        assignedBy: admin._id,
        priority: 'Low',
        status: 'Not Started',
        dueDate: new Date(Date.now() + 86400000 * 6),
      },
    ]);

    console.log('Database seeded successfully with strong credentials.');
    console.log('Admin login: admin@xplore.com / Admin@12345');
    console.log('Employee login: john@xplore.com / User@12345');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed database:', err);
    process.exit(1);
  }
};

seedDB();
