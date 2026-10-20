import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../../types/civic';
import { store } from '../../services/store';
import { AVAILABLE_USERS } from '../../data/mockData';
import {
  Bell,
  RotateCcw,
  Plus,
  Shield,
  User,
  CheckCircle2,
  AlertTriangle,
  Menu,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onOpenReportWizard: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenReportWizard, onToggleSidebar }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(store.currentUser);
  const [notifications, setNotifications] = useState(store.notifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCurrentUser({ ...store.currentUser });
      setNotifications([...store.notifications]);
    });
    return unsub;
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRoleChange = (role: UserRole) => {
    store.switchRole(role);
    setShowRoleSelector(false);
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset CivicScan database to original comprehensive synthetic demonstration scenarios?')) {
      store.resetToDemo();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile hamburger + CivicScan Brand */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 via-indigo-700 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-600/20">
              CS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-slate-900 text-base tracking-tight">CivicScan</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 uppercase tracking-wider">
                  Intel Platform
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block font-medium">
                See the problem. Track the fix. Improve your city.
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls: Role Switcher, Notifications, Reset Demo, Report Action */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="hidden md:inline text-slate-500 font-normal">Active Role:</span>
              <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleSelector && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch User Perspective
                </div>
                {AVAILABLE_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleRoleChange(u.role)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex flex-col ${
                      currentUser.role === u.role
                        ? 'bg-indigo-50 text-indigo-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{u.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 capitalize">
                        {u.role.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal">{u.organization}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleResetDemo}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            title="Reset Synthetic Demonstration Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900">Platform Notifications</h4>
                  <span className="text-[10px] text-slate-400">{unreadCount} unread</span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => store.markNotificationRead(notif.id)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer ${
                        notif.read ? 'bg-slate-50 border-slate-100' : 'bg-indigo-50/50 border-indigo-200'
                      }`}
                    >
                      <div className="font-bold text-slate-800 text-[11px]">{notif.title}</div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{notif.message}</p>
                      <div className="text-[9px] text-slate-400 mt-1">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary Action: Report Issue */}
          <button
            onClick={onOpenReportWizard}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Report Defect</span>
          </button>
        </div>
      </div>
    </header>
  );
};
