import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Pagination } from '../components/Pagination';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { getEmployeeTasksApi, updateTaskStatusApi, getTaskStatsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Clock,
  PlayCircle,
  CheckCircle2,
  Search,
  RefreshCw,
  Mail,
  Calendar,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total: 0,
    notStarted: 0,
    pendingOrInProgress: 0,
    completed: 0,
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [limit] = useState(6);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedDetailTask, setSelectedDetailTask] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchStats = async () => {
    try {
      const res = await getTaskStatsApi();
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching employee task stats:', err);
    }
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEmployeeTasksApi({
        page,
        limit,
        search,
        status: statusFilter,
        priority: priorityFilter,
      });
      setTasks(res.data.tasks);
      setTotalPages(res.data.pagination.totalPages);
      setTotalTasks(res.data.pagination.totalTasks);
    } catch (err) {
      console.error('Error fetching employee tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await updateTaskStatusApi(taskId, newStatus);
      showToast(`Status updated to "${newStatus}". Notification email sent to Admin!`);
      if (selectedDetailTask && selectedDetailTask._id === taskId) {
        setSelectedDetailTask((prev) => ({ ...prev, status: newStatus }));
      }
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold text-xs shadow-2xl flex items-center space-x-2 animate-bounce">
            <Mail className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Employee'}! 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View your assigned deliverables, update task progress, and click any card to inspect full details.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="My Total Tasks"
            count={stats.total}
            icon={CheckSquare}
            color="indigo"
            subtitle="Assigned to your profile"
          />
          <StatCard
            title="Not Started"
            count={stats.notStarted}
            icon={Clock}
            color="amber"
            subtitle="Queued items"
          />
          <StatCard
            title="Pending / In Progress"
            count={stats.pendingOrInProgress}
            icon={PlayCircle}
            color="sky"
            subtitle="Active tasks"
          />
          <StatCard
            title="Completed"
            count={stats.completed}
            icon={CheckCircle2}
            color="emerald"
            subtitle="Finalized deliverables"
          />
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search your assigned tasks..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl glass-input text-xs w-1/2 md:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl glass-input text-xs w-1/2 md:w-auto"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Task Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
            Loading assigned tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center text-slate-500 border border-slate-200 shadow-sm">
            <AlertCircle className="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Tasks Found</h3>
            <p className="text-xs text-slate-500 mt-1">No work items found matching your current filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {tasks.map((task) => (
              <div
                key={task._id}
                onClick={() => setSelectedDetailTask(task)}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-indigo-300 transition cursor-pointer group relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <PriorityBadge priority={task.priority} />
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={task.status} />
                      <span className="opacity-0 group-hover:opacity-100 transition text-indigo-600 bg-indigo-50 p-1 rounded-lg" title="Click card to view details">
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {task.description || 'No detailed description provided.'}
                  </p>
                </div>

                <div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Assigned: {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                    <span>By: {task.assignedBy?.name || 'Admin'}</span>
                  </div>

                  {/* Status Selector */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                      Update Status
                    </label>
                    <select
                      value={task.status}
                      disabled={updatingTaskId === task._id}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task._id, e.target.value);
                      }}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalTasks={totalTasks}
            limit={limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>

        {/* Task Detail Modal */}
        <TaskDetailModal
          isOpen={!!selectedDetailTask}
          onClose={() => setSelectedDetailTask(null)}
          task={selectedDetailTask}
          onStatusChange={handleStatusChange}
          isUpdating={updatingTaskId === selectedDetailTask?._id}
        />
      </main>
    </div>
  );
};
