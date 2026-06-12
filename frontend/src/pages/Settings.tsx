import React from 'react';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { 
  User, Database, Bell, 
  Shield, ToggleLeft, ToggleRight, Server
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Profile settings are read-only for mock assessment mode", "info");
  };

  const handleTestWebhook = () => {
    showToast("Webhook test payload dispatched!", "success");
  };

  return (
    <div className="space-y-6 page-transition">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Workspace Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure client notification triggers, coordinate database endpoints, and toggle aesthetics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: General Profile Form */}
        <div className="clay-card p-6 bg-white dark:bg-[#111113] lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#e5e5e7] dark:border-[#232326]">
            <User className="w-4.5 h-4.5 text-slate-500" />
            <h3 className="text-sm font-bold text-black dark:text-white">Admin Profile Specifications</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.full_name || "Administrator"}
                  className="dashboard-input"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Directory Address
                </label>
                <input
                  type="email"
                  defaultValue={user?.email || "admin@inventoryflow.ai"}
                  className="dashboard-input"
                  placeholder="admin@inventoryflow.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Account Created
              </label>
              <input
                type="text"
                disabled
                value={user ? new Date(user.created_at).toLocaleString() : ""}
                className="dashboard-input bg-[#f5f5f7] dark:bg-[#18181c] disabled:opacity-70 cursor-not-allowed"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="gradient-btn text-xs font-semibold cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Options and Database parameters */}
        <div className="space-y-6">
          {/* Customizations Theme */}
          <div className="clay-card p-6 bg-white dark:bg-[#111113]">
            <div className="flex items-center gap-2 pb-4 border-b border-[#e5e5e7] dark:border-[#232326] mb-4">
              <Shield className="w-4.5 h-4.5 text-slate-500" />
              <h3 className="text-sm font-bold text-black dark:text-white">Interface Customization</h3>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-black dark:text-white">Dark Mode Interface</p>
                <p className="text-[10px] text-slate-400">Toggle dark color themes for low-light environments.</p>
              </div>
              <button 
                onClick={toggleTheme}
                className="p-1 text-black dark:text-white hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                {theme === 'dark' ? (
                  <ToggleRight className="w-10 h-10 text-white" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Infrastructure Metrics */}
          <div className="clay-card p-6 bg-white dark:bg-[#111113]">
            <div className="flex items-center gap-2 pb-4 border-b border-[#e5e5e7] dark:border-[#232326] mb-4">
              <Database className="w-4.5 h-4.5 text-slate-500" />
              <h3 className="text-sm font-bold text-black dark:text-white">System Architecture</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-[#e5e5e7] dark:border-[#232326]/40 pb-2">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-slate-400" />
                  API Backend
                </span>
                <span className="font-bold text-black dark:text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
                  ONLINE
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[#e5e5e7] dark:border-[#232326]/40 pb-2">
                <span className="text-slate-500 font-medium">Database Core</span>
                <span className="font-bold text-slate-705 dark:text-slate-350">SQLite (inventoryflow.db)</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#e5e5e7] dark:border-[#232326]/40 pb-2">
                <span className="text-slate-500 font-medium">ORM Engine</span>
                <span className="font-bold text-slate-705 dark:text-slate-350">SQLAlchemy 2.0</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Router Service</span>
                <span className="font-bold text-slate-705 dark:text-slate-350">FastAPI ASGI</span>
              </div>
            </div>
          </div>

          {/* Webhooks Notifications trigger */}
          <div className="clay-card p-6 bg-white dark:bg-[#111113]">
            <div className="flex items-center gap-2 pb-4 border-b border-[#e5e5e7] dark:border-[#232326] mb-4">
              <Bell className="w-4.5 h-4.5 text-slate-500" />
              <h3 className="text-sm font-bold text-black dark:text-white">Webhook Integration</h3>
            </div>

            <p className="text-[11px] text-slate-450 mb-4">
              Receive live webhook triggers on low-stock conditions or newly placed customer orders.
            </p>

            <button
              onClick={handleTestWebhook}
              className="w-full flex items-center justify-center gap-2 py-2 border border-[#e5e5e7] dark:border-[#232326] hover:border-black dark:hover:border-white text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Test Dispatch Webhook
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
