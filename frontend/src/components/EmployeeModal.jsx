import React, { useState } from 'react';
import { X, UserPlus, Users, Briefcase, Mail, Calendar, CheckCircle2, Clock, PlayCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { createEmployeeApi } from '../services/api';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

export const EmployeeModal = ({ isOpen, onClose, employees = [], tasks = [], onEmployeeCreated }) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Detailed view

  // Form states for creating new employee
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

  // Helper to compute tasks assigned to selected employee
  const getEmployeeTasks = (empId) => {
    if (!empId) return [];
    return tasks.filter(
      (task) =>
        (task.assignedEmployee?._id || task.assignedEmployee) === empId
    );
  };

  const selectedEmployeeTasks = selectedEmployee ? getEmployeeTasks(selectedEmployee._id) : [];
  const completedCount = selectedEmployeeTasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = selectedEmployeeTasks.filter((t) => t.status === 'In Progress' || t.status === 'Pending').length;
  const notStartedCount = selectedEmployeeTasks.filter((t) => t.status === 'Not Started').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Detailed View Header */}
        {selectedEmployee ? (
          <div>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 mb-3 group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
              Back to Employee Directory
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-extrabold text-white text-base shadow-md">
                {selectedEmployee.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {selectedEmployee.name}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedEmployee.email}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {selectedEmployee.designation || 'Developer'}</span>
                </p>
              </div>
            </div>

            {/* Employee Task Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-500">Completed</p>
                <p className="text-lg font-extrabold text-emerald-600 mt-0.5 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {completedCount}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-500">In Progress</p>
                <p className="text-lg font-extrabold text-indigo-600 mt-0.5 flex items-center justify-center gap-1">
                  <PlayCircle className="w-4 h-4" />
                  {inProgressCount}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-500">Not Started</p>
                <p className="text-lg font-extrabold text-slate-600 mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />
                  {notStartedCount}
                </p>
              </div>
            </div>

            {/* Assigned Tasks List */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Assigned Work Items ({selectedEmployeeTasks.length})
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
              {selectedEmployeeTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">
                  No active tasks currently assigned to {selectedEmployee.name}.
                </p>
              ) : (
                selectedEmployeeTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100/80 transition"
                  >
                    <div className="max-w-md">
                      <p className="text-xs font-bold text-slate-900 truncate">{task.title}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {task.description || 'No description'}
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
                <p className="text-xs text-slate-500">Click any employee card to view detailed tasks and profile</p>
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
                        className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-200 hover:border-indigo-300 hover:bg-slate-100/90 cursor-pointer transition group"
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
                          <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
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
