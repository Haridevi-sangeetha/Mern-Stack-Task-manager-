import React, { useState } from 'react';
import { X, UserPlus, Users, Briefcase, Mail } from 'lucide-react';
import { createEmployeeApi } from '../services/api';

export const EmployeeModal = ({ isOpen, onClose, employees = [], onEmployeeCreated }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Engineering');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Employee Directory</h2>
            <p className="text-xs text-slate-500">View team members or add new employee accounts</p>
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
              employees.map((emp) => (
                <div
                  key={emp._id}
                  className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                      {emp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{emp.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {emp.email}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {emp.designation || 'Engineer'}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {emp.department || 'Tech'}
                  </span>
                </div>
              ))
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
                  placeholder="Engineering"
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
    </div>
  );
};
