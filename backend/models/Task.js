import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned employee is required'],
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Not Started', 'Pending', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  dueDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

export const Task = mongoose.model('Task', taskSchema);
