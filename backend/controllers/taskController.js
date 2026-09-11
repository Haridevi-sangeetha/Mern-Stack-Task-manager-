import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { sendTaskAssignmentEmail, sendTaskStatusUpdateEmail } from '../utils/sendEmail.js';

// @desc    Create a new task & assign to an employee (Admin)
// @route   POST /api/tasks
// @access  Private/Admin
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedEmployee, priority, dueDate } = req.body;

    if (!title || !assignedEmployee) {
      return res.status(400).json({ message: 'Task title and assigned employee are required' });
    }

    const employee = await User.findById(assignedEmployee);
    if (!employee || employee.role !== 'Employee') {
      return res.status(404).json({ message: 'Target assigned employee not found' });
    }

    const task = await Task.create({
      title,
      description,
      assignedEmployee,
      assignedBy: req.user._id,
      priority: priority || 'Medium',
      status: 'Not Started',
      dueDate: dueDate || null,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedEmployee', 'name email department designation')
      .populate('assignedBy', 'name email');

    // Trigger email notification to employee (async without blocking HTTP response)
    sendTaskAssignmentEmail({
      employeeEmail: employee.email,
      employeeName: employee.name,
      taskTitle: task.title,
      priority: task.priority,
      description: task.description,
      adminName: req.user.name,
    }).catch(err => console.error('[Email Error]:', err.message));

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// @desc    Get all tasks with search, filter & pagination (Admin)
// @route   GET /api/tasks/admin
// @access  Private/Admin
export const getAdminTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, status, priority, employeeId } = req.query;

    const query = {};

    // Filter by search (title or description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by priority
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Filter by specific employee
    if (employeeId && employeeId !== 'All') {
      query.assignedEmployee = employeeId;
    }

    const totalTasks = await Task.countDocuments(query);
    const totalPages = Math.ceil(totalTasks / limit) || 1;

    const tasks = await Task.find(query)
      .populate('assignedEmployee', 'name email department designation')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        totalTasks,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin tasks', error: error.message });
  }
};

// @desc    Get tasks assigned to logged-in employee (Employee)
// @route   GET /api/tasks/my-tasks
// @access  Private/Employee
export const getEmployeeTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, status, priority } = req.query;

    const query = { assignedEmployee: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    const totalTasks = await Task.countDocuments(query);
    const totalPages = Math.ceil(totalTasks / limit) || 1;

    const tasks = await Task.find(query)
      .populate('assignedEmployee', 'name email department')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        totalTasks,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee tasks', error: error.message });
  }
};

// @desc    Update task status (Employee or Admin) & notify Admin
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Not Started', 'Pending', 'In Progress', 'Completed'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    const task = await Task.findById(req.params.id)
      .populate('assignedEmployee', 'name email')
      .populate('assignedBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization: Employee can only update their own assigned task
    if (req.user.role === 'Employee' && task.assignedEmployee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden. You can only update your own assigned tasks.' });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    // Trigger email notification to Admin when employee updates status
    if (req.user.role === 'Employee') {
      sendTaskStatusUpdateEmail({
        adminEmail: task.assignedBy ? task.assignedBy.email : process.env.ADMIN_EMAIL,
        employeeName: req.user.name,
        taskTitle: task.title,
        oldStatus,
        newStatus: status,
      }).catch(err => console.error('[Email Status Update Error]:', err.message));
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task status', error: error.message });
  }
};

// @desc    Update full task details (Admin)
// @route   PUT /api/tasks/:id
// @access  Private/Admin
export const updateTask = async (req, res) => {
  try {
    const { title, description, assignedEmployee, priority, status, dueDate } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedEmployee) task.assignedEmployee = assignedEmployee;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedEmployee', 'name email department designation')
      .populate('assignedBy', 'name email');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// @desc    Delete a task (Admin)
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

// @desc    Get dashboard statistics for task overview (Admin)
// @route   GET /api/tasks/stats
// @access  Private
export const getTaskStats = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Employee') {
      query.assignedEmployee = req.user._id;
    }

    const notStarted = await Task.countDocuments({ ...query, status: 'Not Started' });
    const pending = await Task.countDocuments({ ...query, status: 'Pending' });
    const inProgress = await Task.countDocuments({ ...query, status: 'In Progress' });
    const completed = await Task.countDocuments({ ...query, status: 'Completed' });
    const total = await Task.countDocuments(query);

    const highPriority = await Task.countDocuments({ ...query, priority: 'High' });
    const mediumPriority = await Task.countDocuments({ ...query, priority: 'Medium' });
    const lowPriority = await Task.countDocuments({ ...query, priority: 'Low' });

    res.json({
      total,
      notStarted,
      pending,
      inProgress,
      pendingOrInProgress: pending + inProgress,
      completed,
      priority: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task statistics', error: error.message });
  }
};
