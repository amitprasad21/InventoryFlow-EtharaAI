import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { getDashboardStats, type LowStockWidget } from '../services/analytics';
import { 
  Warehouse, LayoutDashboard, Package, Users, ShoppingCart, 
  BarChart3, Settings, LogOut, Sun, Moon, Bell, Menu, X, 
  AlertTriangle
} from 'lucide-react';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<LowStockWidget[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Fetch low stock items to populate notifications bell
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const stats = await getDashboardStats();
        setNotifications(stats.low_stock_alerts);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    fetchNotifs();
    
    // Poll every 30s
    const timer = setInterval(fetchNotifs, 30000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f4f6] dark:bg-[#050507] flex items-center justify-center p-0 md:p-6 transition-colors duration-300 overflow-x-hidden">
      {/* Central App Card */}
      <div className="w-full max-w-[1400px] min-h-screen md:min-h-[calc(100vh-3rem)] bg-white dark:bg-[#0d0d0f] md:rounded-[36px] md:shadow-[0_20px_50px_rgba(0,0,0,0.03)] dark:md:shadow-[0_20px_50px_rgba(0,0,0,0.55)] flex p-4 md:p-6 transition-all relative gap-6 border border-[#e5e5e7] dark:border-[#232326]/60">
        
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside className={`
          w-64 bg-[#fbfbfd] dark:bg-[#111113] border border-[#e5e5e7] dark:border-[#232326] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.01)]
          transform lg:transform-none lg:opacity-100 transition-all duration-300 justify-between overflow-hidden
          lg:sticky lg:top-0 lg:h-[calc(100vh-6rem)]
          fixed inset-y-4 sm:inset-y-6 left-4 sm:left-6 z-50
          ${sidebarOpen ? 'translate-x-0 opacity-100 flex flex-col' : '-translate-x-full lg:translate-x-0 hidden lg:flex lg:flex-col'}
        `}>
          <div>
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-[#e5e5e7] dark:border-[#232326]">
              <Link to="/dashboard" className="flex items-center gap-2.5">
                <div className="p-1.5 bg-black dark:bg-white rounded-xl shadow-md">
                  <Warehouse className="w-5 h-5 text-white dark:text-black" />
                </div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-black to-[#232326] dark:from-white dark:to-slate-350 bg-clip-text text-transparent">
                  InventoryFlow
                </span>
              </Link>
              <button 
                className="lg:hidden p-1 rounded-lg hover:bg-[#f5f5f7] dark:hover:bg-[#232326] text-slate-500 dark:text-slate-400"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-md' 
                        : 'text-slate-505 dark:text-slate-400 hover:bg-[#f5f5f7] dark:hover:bg-[#18181c] hover:text-black dark:hover:text-white'}
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-black' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#e5e5e7] dark:border-[#232326] bg-[#f5f5f7]/40 dark:bg-[#18181c]/20">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-9 h-9 rounded-full bg-black/5 border border-black/10 text-black dark:bg-white/10 dark:border-white/20 dark:text-white flex items-center justify-center font-bold text-xs">
                {user?.full_name?.charAt(0) || user?.email.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.full_name || 'Admin User'}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#e6eae2] dark:border-[#2b3a2a] hover:border-rose-200 dark:hover:border-rose-900 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white dark:bg-[#111113] border border-[#e5e5e7] dark:border-[#232326] rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex items-center justify-between px-6 sticky top-0 z-30 transition-all duration-300 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg border border-[#e5e5e7] dark:border-[#232326] text-slate-600 dark:text-slate-400"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                <span>Overview</span>
                <span>/</span>
                <span className="text-black dark:text-white capitalize font-extrabold">
                  {location.pathname.substring(1) || 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-[#e5e5e7] dark:border-[#232326] text-black dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#18181c] transition-colors cursor-pointer"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-black" />}
              </button>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="p-2 rounded-xl border border-[#e5e5e7] dark:border-[#232326] text-black dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#18181c] transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111113] border border-[#e5e5e7] dark:border-[#232326] rounded-2xl shadow-xl z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Warnings</h4>
                        <span className="text-[10px] bg-rose-500/10 text-rose-500 font-semibold px-2 py-0.5 rounded-full">
                          {notifications.length} Alerts
                        </span>
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-400 dark:text-slate-550 text-center py-4">All stocks are normal.</p>
                        ) : (
                          notifications.map((item) => (
                            <div 
                              key={item.id}
                              className="flex items-start gap-2.5 p-2 rounded-xl bg-[#f5f5f7] dark:bg-[#18181c] hover:bg-[#eaeaea] dark:hover:bg-[#232326] border border-[#e5e5e7] dark:border-[#232326] cursor-pointer"
                              onClick={() => {
                                setShowNotifMenu(false);
                                navigate('/products');
                              }}
                            >
                              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                                <p className="text-[10px] text-slate-550 dark:text-slate-400">SKU: {item.sku} | Qty: <span className="font-bold text-rose-600 dark:text-rose-400">{item.quantity}</span></p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="w-px h-6 bg-[#e5e5e7] dark:bg-[#232326] mx-1 hidden sm:block" />

              {/* Profile Avatar info */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-semibold text-black dark:text-white">
                  {user?.full_name || 'Admin'}
                </span>
                <div className="w-8 h-8 rounded-full bg-black/5 border border-black/10 text-black dark:bg-white/10 dark:border-white/20 dark:text-white flex items-center justify-center font-bold text-xs">
                  {user?.full_name?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </header>

          {/* Page Inner Container */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
