import React, { useEffect } from 'react';
import { X, Calendar, User, ShieldCheck, Clock, FileText, CheckCircle2, Tag } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';

export const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  onStatusChange,
  isUpdating = false,
  isAdmin = false,
  onEditTask,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative cursor-default transition-all transform animate-scaleUp"
      >
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 px-6 py-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Close detail modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 mb-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white pr-8 leading-snug">
            {task.title}
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Description Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Task Description</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {task.description || 'No detailed description provided for this task.'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assigned Employee */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Assigned Employee</p>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {task.assignedEmployee?.name || 'Unassigned'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {task.assignedEmployee?.email || 'N/A'}
                </p>
              </div>
            </div>

            {/* Assigned By */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Assigned By</p>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {task.assignedBy?.name || 'Admin'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {task.assignedBy?.email || 'Administrator'}
                </p>
              </div>
            </div>

            {/* Created Date */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Created On</p>
                <p className="text-xs font-semibold text-slate-800">{formatDate(task.createdAt)}</p>
              </div>
            </div>

            {/* Due Date */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Target Due Date</p>
                <p className="text-xs font-semibold text-slate-800">
                  {task.dueDate ? formatDate(task.dueDate) : 'No due date set'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Status Update inside Modal */}
          {onStatusChange && (
            <div className="pt-4 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Update Task Status</span>
              </label>
              <select
                value={task.status}
                disabled={isUpdating}
                onChange={(e) => onStatusChange(task._id, e.target.value)}
                className="w-full px-4 py-3 rounded-2xl glass-input text-xs font-semibold text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Not Started">Not Started</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Last modified: {formatDate(task.updatedAt)}
          </div>
          <div className="flex items-center space-x-3">
            {isAdmin && onEditTask && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditTask(task);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition"
              >
                Edit Details
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
