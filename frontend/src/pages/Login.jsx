import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, Mail, CheckSquare, ArrowRight, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [role, setRole] = useState('Admin');
  const [email, setEmail] = useState('admin@xplore.com');
  const [password, setPassword] = useState('Admin@12345');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = (selectedRole) => {
    setRole(selectedRole);
    setLocalError('');
    if (selectedRole === 'Admin') {
      setEmail('admin@xplore.com');
      setPassword('Admin@12345');
    } else {
      setEmail('john@xplore.com');
      setPassword('User@12345');
    }
  };

  const validateInputs = () => {
    if (!email.trim()) {
      setLocalError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError('Please enter a valid email address (e.g. name@company.com).');
      return false;
    }
    if (!password) {
      setLocalError('Password is required.');
      return false;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!validateInputs()) return;

    try {
      setSubmitting(true);
      const user = await login(email, password, role);
      if (user.role === 'Admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 shadow-md mb-3">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Task Management System
          </h1>
          <p className="text-xs text-slate-500 mt-1">Authentication Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
          {/* Role Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => handleRoleSwitch('Admin')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition ${
                role === 'Admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSwitch('Employee')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition ${
                role === 'Employee'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Employee Portal</span>
            </button>
          </div>

          {localError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@xplore.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 transition ${
                role === 'Admin'
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
              } disabled:opacity-50 mt-2`}
            >
              <span>{submitting ? 'Authenticating...' : `Sign In as ${role}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Test Accounts Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Default Accounts:</p>
            <p>Admin: admin@xplore.com | Admin@12345</p>
            <p>Employee: john@xplore.com | User@12345</p>
          </div>
        </div>
      </div>
    </div>
  );
};
