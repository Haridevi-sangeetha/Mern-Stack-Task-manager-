import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Pagination } from '../components/Pagination';
import { TaskModal } from '../components/TaskModal';
import { EmployeeModal } from '../components/EmployeeModal';
import { TaskDetailModal } from '../components/TaskDetailModal';
import {
  getAdminTasksApi,
  getTaskStatsApi,
  getEmployeesApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
} from '../services/api';
import {
  ListTodo,
  Clock,
  PlayCircle,
  CheckCircle2,
  Plus,
  Users,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Mail,
  Eye,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    notStarted: 0,
    pendingOrInProgress: 0,
    completed: 0,
  });

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [limit] = useState(7);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDetailTask, setSelectedDetailTask] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchStats = async () => {
    try {
      const res = await getTaskStatsApi();
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching task stats:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await getEmployeesApi();
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminTasksApi({
        page,
        limit,
        search,
        status: statusFilter,
        priority: priorityFilter,
        employeeId: employeeFilter,
      });
      setTasks(res.data.tasks);
      setTotalPages(res.data.pagination.totalPages);
      setTotalTasks(res.data.pagination.totalTasks);
    } catch (err) {
      console.error('Error fetching admin tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, priorityFilter, employeeFilter]);

  useEffect(() => {
    fetchStats();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateOrUpdateTask = async (taskData) => {
    if (selectedTask) {
      await updateTaskApi(selectedTask._id, taskData);
      showToast('Task updated successfully!');
    } else {
      await createTaskApi(taskData);
      showToast('Task created and notification email sent to employee!');
    }
    fetchTasks();
    fetchStats();
  };

  const handleDeleteTask = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete task "${title}"?`)) {
      try {
        await deleteTaskApi(id);
        showToast('Task deleted successfully');
        fetchTasks();
        fetchStats();
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const openCreateModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-indigo-600 text-white font-semibold text-xs shadow-2xl flex items-center space-x-2 animate-bounce">
            <Mail className="w-4 h-4 text-indigo-200" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin Task Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage employees, assign work orders, and monitor real-time completion progress.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEmployeeModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition border border-slate-200 shadow-sm"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Employees ({employees.length})</span>
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Task</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Tasks"
            count={stats.total}
            icon={ListTodo}
            color="indigo"
            subtitle="Overall workload"
          />
          <StatCard
            title="Not Started"
            count={stats.notStarted}
            icon={Clock}
            color="amber"
            subtitle="Queued tasks"
          />
          <StatCard
            title="Pending / In Progress"
            count={stats.pendingOrInProgress}
            icon={PlayCircle}
            color="sky"
            subtitle="Active development"
          />
          <StatCard
            title="Completed Tasks"
            count={stats.completed}
            icon={CheckCircle2}
            color="emerald"
            subtitle="Delivered successfully"
          />
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search title or description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                <option value="All">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <select
                value={employeeFilter}
                onChange={(e) => {
                  setEmployeeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                <option value="All">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Task Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Task Details</th>
                  <th className="py-3.5 px-4">Assigned Employee</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                      Loading tasks...
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 text-sm leading-snug">{task.title}</p>
                        <p className="text-slate-500 text-xs truncate mt-0.5" title={task.description}>
                          {task.description || 'No description'}
                        </p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {task.assignedEmployee ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                              {task.assignedEmployee.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{task.assignedEmployee.name}</p>
                              <p className="text-[10px] text-slate-500">{task.assignedEmployee.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                        {new Date(task.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => setSelectedDetailTask(task)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="View Task Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit Task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id, task.title)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalTasks={totalTasks}
              limit={limit}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </div>
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateOrUpdateTask}
        initialTask={selectedTask}
        employees={employees}
      />

      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        employees={employees}
        tasks={tasks}
        onEmployeeCreated={fetchEmployees}
      />

      <TaskDetailModal
        isOpen={!!selectedDetailTask}
        onClose={() => setSelectedDetailTask(null)}
        task={selectedDetailTask}
        isAdmin={true}
        onEditTask={openEditModal}
      />
    </div>
  );
};
