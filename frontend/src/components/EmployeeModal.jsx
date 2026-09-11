import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Users,
  Briefcase,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  PlayCircle,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Building,
  BarChart3,
  Award,
} from 'lucide-react';
import { createEmployeeApi } from '../services/api';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

export const EmployeeModal = ({ isOpen, onClose, employees = [], tasks = [], onEmployeeCreated }) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Detailed View state

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Development');
  const [designation, setDesignation] = useState('Software Engineer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const res = await createEmployeeApi({ name, email, password, department, designation });
      setSuccess(`Employee "${res.data.name}" registered successfully!`);
      setName('');
      setEmail('');
      setPassword('');
      onEmployeeCreated();
      setTimeout(() => {
        setActiveTab('list');
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering employee');
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeTasks = (empId) => {
    if (!empId) return [];
    return tasks.filter(
      (task) => (task.assignedEmployee?._id || task.assignedEmployee) === empId
    );
  };

  const selectedEmployeeTasks = selectedEmployee ? getEmployeeTasks(selectedEmployee._id) : [];
  const totalTaskCount = selectedEmployeeTasks.length;
  const completedCount = selectedEmployeeTasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = selectedEmployeeTasks.filter((t) => t.status === 'In Progress' || t.status === 'Pending').length;
  const notStartedCount = selectedEmployeeTasks.filter((t) => t.status === 'Not Started').length;
  const completionRate = totalTaskCount > 0 ? Math.round((completedCount / totalTaskCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Detailed Employee Profile View */}
        {selectedEmployee ? (
          <div>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
              Back to Employee Directory
            </button>

            {/* Profile Header Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-extrabold text-white text-lg shadow-md">
                    {selectedEmployee.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                        {selectedEmployee.name}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {selectedEmployee.role || 'Employee'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedEmployee.email}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedEmployee.designation || 'Developer'}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>Dept: <strong>{selectedEmployee.department || 'Tech'}</strong></span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Joined: {new Date(selectedEmployee.createdAt || Date.now()).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Completion Rate Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                    Overall Completion Progress
                  </span>
                  <span className="text-indigo-600">{completionRate}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Task Metrics Grid */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-500">Total Tasks</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {totalTaskCount}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <p className="text-[10px] font-bold uppercase text-emerald-700">Completed</p>
                <p className="text-lg font-extrabold text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {completedCount}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                <p className="text-[10px] font-bold uppercase text-indigo-700">In Progress</p>
                <p className="text-lg font-extrabold text-indigo-700 mt-0.5 flex items-center justify-center gap-1">
                  <PlayCircle className="w-4 h-4" />
                  {inProgressCount}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-600">Not Started</p>
                <p className="text-lg font-extrabold text-slate-700 mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />
                  {notStartedCount}
                </p>
              </div>
            </div>

            {/* Tasks List */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Assigned Work Deliverables ({selectedEmployeeTasks.length})
              </h3>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1">
              {selectedEmployeeTasks.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs italic">
                  No active tasks assigned to {selectedEmployee.name}.
                </div>
              ) : (
                selectedEmployeeTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100/90 transition"
                  >
                    <div className="max-w-md">
                      <p className="text-xs font-bold text-slate-900 leading-snug">{task.title}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {task.description || 'No description provided.'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Employee Directory</h2>
                <p className="text-xs text-slate-500">Click any employee to view their full profile & assigned tasks</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-5">
              <button
                onClick={() => setActiveTab('list')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition ${
                  activeTab === 'list'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                All Employees ({employees.length})
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'create'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add New Employee
              </button>
            </div>

            {activeTab === 'list' ? (
              <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                {employees.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No employees found.</p>
                ) : (
                  employees.map((emp) => {
                    const empTaskCount = getEmployeeTasks(emp._id).length;
                    return (
                      <div
                        key={emp._id}
                        onClick={() => setSelectedEmployee(emp)}
                        className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-200 hover:border-indigo-400 hover:bg-slate-100/90 cursor-pointer transition group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                            {emp.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {emp.name}
                            </h4>
                            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {emp.email}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {emp.designation || 'Engineer'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                            {empTaskCount} {empTaskCount === 1 ? 'Task' : 'Tasks'}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {emp.department || 'Tech'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Robert Martin"
                      className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. robert@xplore.com"
                      className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Development"
                      className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="React Developer"
                      className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Register Employee'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
