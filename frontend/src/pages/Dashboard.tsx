import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, type DashboardStats } from '../services/analytics';
import { cancelOrder } from '../services/orders';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../hooks/useTheme';
import { 
  IndianRupee, ShoppingBag, 
  Users, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Download, Loader2, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      showToast("Could not load dashboard statistics", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm(`Are you sure you want to cancel Order #${orderId}? This will refund the inventory.`)) {
      try {
        await cancelOrder(orderId);
        showToast(`Order #${orderId} cancelled. Inventory returned.`, 'success');
        fetchStats(); // Reload dashboard numbers
      } catch (err: any) {
        console.error(err);
        showToast(err.response?.data?.detail || "Failed to cancel order", 'error');
      }
    }
  };

  const exportCSV = () => {
    if (!stats || stats.recent_orders.length === 0) return;
    
    // Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID,Customer,Total Amount,Status,Date\n";
    
    // Rows
    stats.recent_orders.forEach((o) => {
      csvContent += `${o.id},"${o.customer_name}",₹${o.total_amount.toFixed(2)},${o.status},${o.created_at.substring(0, 10)}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `recent_orders_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV Exported successfully", "success");
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-[#2b3e2a] dark:text-[#a5bda3] animate-spin" />
        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Assembling your workspace...</p>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      growth: stats?.revenue_growth,
      icon: IndianRupee,
      color: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',
    },
    {
      title: 'Orders Placed',
      value: stats?.total_orders.toString(),
      growth: stats?.orders_growth,
      icon: ShoppingBag,
      color: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',
    },
    {
      title: 'Total Customers',
      value: stats?.total_customers.toString(),
      growth: stats?.customers_growth,
      icon: Users,
      color: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',
    },
    {
      title: 'Products in Catalog',
      value: stats?.total_products.toString(),
      growth: stats?.products_growth,
      icon: AlertTriangle,
      color: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',
    },
  ];

  return (
    <div className="space-y-6 page-transition">
      {/* Welcome & Action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-850 dark:text-white">Workspace Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-time health statistics of your business operations.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-[#e6eae2] dark:border-[#2b3a2a] rounded-xl hover:bg-white dark:hover:bg-[#1b251a] text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Orders
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 px-4 py-2 gradient-btn text-xs font-semibold cursor-pointer shadow-lg"
          >
            Manage Orders
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isPositive = (kpi.growth || 0) >= 0;
          return (
            <div key={idx} className="clay-card p-6 bg-white dark:bg-[#111113]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`p-2.5 rounded-xl ${kpi.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-black dark:text-white tracking-tight">
                  {kpi.value}
                </h3>
                
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                    isPositive 
                      ? 'bg-black/5 text-black dark:bg-white/10 dark:text-white' 
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(kpi.growth || 0)}%
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                    vs last month
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Warning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="clay-card p-6 bg-white dark:bg-[#111113] lg:col-span-2 flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-black dark:text-white">Revenue Performance</h2>
              <p className="text-xs text-slate-450 dark:text-slate-500">Monthly aggregate sales curves.</p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
                <span className="text-slate-700 dark:text-slate-350">Revenue</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenue_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? '#ffffff' : '#000000'} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={theme === 'dark' ? '#ffffff' : '#000000'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e7" className="dark:stroke-[#232326]" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? 'rgba(17, 17, 19, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                    borderColor: theme === 'dark' ? '#232326' : '#e5e5e7',
                    borderRadius: '16px',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    fontSize: '12px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)'
                  }}
                  itemStyle={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                  labelStyle={{ fontWeight: 'bold', color: '#8e8e93' }}
                />
                <Area type="monotone" dataKey="revenue" stroke={theme === 'dark' ? '#ffffff' : '#000000'} strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts Panel */}
        <div className="clay-card p-6 bg-white dark:bg-[#111113] flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-black dark:text-white">Low Stock Warnings</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-full">
                {stats?.low_stock_alerts.length} Warnings
              </span>
            </div>
            <p className="text-xs text-slate-450 dark:text-slate-500 mb-4">Items requiring urgent restocking.</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[260px] space-y-2 pr-1">
            {stats?.low_stock_alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-550">
                <AlertTriangle className="w-8 h-8 text-slate-300 dark:text-slate-750 mb-2" />
                <p className="text-xs font-semibold">All inventory levels normal.</p>
              </div>
            ) : (
              stats?.low_stock_alerts.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#e5e5e7] dark:border-[#232326] bg-[#f5f5f7]/60 dark:bg-[#18181c]/40 hover:bg-[#eaeaea]/60 dark:hover:bg-[#232326]/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase">SKU: {item.sku}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-650 dark:text-slate-300">
                      {item.quantity} Left
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'out_of_stock'
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {item.status === 'out_of_stock' ? 'OUT' : 'LOW'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button
            onClick={() => navigate('/products')}
            className="w-full mt-4 text-center text-xs font-semibold text-black dark:text-white hover:underline py-2 hover:bg-[#f5f5f7] dark:hover:bg-[#18181c] rounded-xl transition-colors cursor-pointer"
          >
            Review Catalog Stock
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="clay-card p-6 bg-white dark:bg-[#111113]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-base font-bold text-black dark:text-white">Recent Transactions</h2>
            <p className="text-xs text-slate-450 dark:text-slate-500">Latest business purchases.</p>
          </div>
          <button 
            onClick={() => navigate('/orders')} 
            className="text-xs font-bold text-black dark:text-white hover:underline cursor-pointer"
          >
            View All Transactions
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e5e5e7] dark:border-[#232326]">
                <th className="pb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="pb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="pb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date</th>
                <th className="pb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</th>
                <th className="pb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                <th className="pb-3 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e7] dark:divide-[#232326]/60">
              {stats?.recent_orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-450 dark:text-slate-500 font-medium">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                stats?.recent_orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#f5f5f7] dark:hover:bg-[#18181c]">
                    <td className="py-3.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      #{o.id}
                    </td>
                    <td className="py-3.5">
                      <div>
                        <p className="text-xs font-bold text-black dark:text-white">{o.customer_name}</p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-550">{o.customer_email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(o.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 text-xs font-extrabold text-black dark:text-white">
                      ₹{o.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        o.status === 'Delivered'
                          ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                          : o.status === 'Processing'
                          ? 'bg-slate-100 text-slate-700 dark:bg-[#18181c] dark:text-slate-300'
                          : o.status === 'Cancelled'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {o.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleCancelOrder(o.id)}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
