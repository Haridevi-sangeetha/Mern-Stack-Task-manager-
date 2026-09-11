import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, User, CheckSquare } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Task Management System
              </span>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full">
                <div className={`p-1.5 rounded-full ${isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {user.role} ({user.department || 'Tech'})
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
