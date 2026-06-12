import React, { useState, useEffect } from 'react';
import { getDashboardStats, type DashboardStats } from '../services/analytics';
import { useTheme } from '../hooks/useTheme';
import { 
  TrendingUp, ShoppingBag, Users, History, Package, Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell
} from 'recharts';

export const Analytics: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load analytics details", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-[#2b3e2a] dark:text-[#a5bda3] animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Compiling business intelligence charts...</p>
      </div>
    );
  }

  // Color constants for charts (shades of black, charcoal, dark gray, silver)
  const COLORS = theme === 'dark' 
    ? ['#ffffff', '#e5e5ea', '#d1d1d6', '#aeaeb2', '#8e8e93', '#636366'] 
    : ['#000000', '#1c1c1e', '#2c2c2e', '#3a3a3c', '#48484a', '#8e8e93'];

  // Construct mock category aggregation from current products
  const categoryChartData = [
    { name: 'Electronics', value: 3 },
    { name: 'Audio', value: 1 },
    { name: 'Furniture', value: 1 },
    { name: 'Peripherals', value: 1 },
    { name: 'Accessories', value: 1 },
  ];

  // Construct mock customer registration timeline
  const customerGrowthData = [
    { name: 'Jan', registered: 4 },
    { name: 'Feb', registered: 10 },
    { name: 'Mar', registered: 15 },
    { name: 'Apr', registered: 22 },
    { name: 'May', registered: 31 },
    { name: 'Jun', registered: 45 },
  ];

  // Activity log timeline entries
  const timelineEvents = [
    {
      id: 1,
      title: "Stock Alert Triggered",
      desc: "Mechanical Keyboard (SKU: MECHKEYB) has dropped to 2 units.",
      time: "2 hours ago",
      type: "alert",
      color: "text-amber-500 bg-amber-500/10"
    },
    {
      id: 2,
      title: "New Customer Signup",
      desc: "Michael Wilson registered with email michael.w@techcorp.com.",
      time: "1 day ago",
      type: "user",
      color: "text-blue-500 bg-blue-500/10"
    },
    {
      id: 3,
      title: "Transaction Order Placed",
      desc: "Order #3 placed for Customer Robert Johnson. Total: $329.98.",
      time: "3 days ago",
      type: "order",
      color: "text-[#2b3e2a] bg-[#2b3e2a]/10"
    },
    {
      id: 4,
      title: "Product Inventory Update",
      desc: "iPhone 15 Pro Max (SKU: IPHONE15PM) stock updated by administrator.",
      time: "5 days ago",
      type: "product",
      color: "text-purple-500 bg-purple-500/10"
    },
    {
      id: 5,
      title: "Transaction Order Cancelled",
      desc: "Order #5 marked Cancelled by administrator. Inventory restocked.",
      time: "1 week ago",
      type: "cancel",
      color: "text-rose-500 bg-rose-500/10"
    }
  ];

  return (
    <div className="space-y-6 page-transition">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Business Intelligence</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Evaluate product velocity curves, stock configurations, and registration trends.</p>
      </div>

      {/* Grid containing Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Revenue Area Chart */}
        <div className="clay-card p-6 bg-white dark:bg-[#111113] min-w-0 overflow-hidden">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-black dark:text-white" />
              Sales Curve & Projections
            </h3>
            <p className="text-[11px] text-slate-400">Monthly aggregate sales cash flows (₹ INR).</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenue_chart}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? '#ffffff' : '#000000'} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={theme === 'dark' ? '#ffffff' : '#000000'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e7" className="dark:stroke-[#232326]" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
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
                <Area type="monotone" dataKey="revenue" stroke={theme === 'dark' ? '#ffffff' : '#000000'} strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" name="Sales Amount" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weekly Orders Bar Chart */}
        <div className="clay-card p-6 bg-white dark:bg-[#111113] min-w-0 overflow-hidden">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4.5 h-4.5 text-slate-500" />
              Purchase Frequencies
            </h3>
            <p className="text-[11px] text-slate-400">Volume distribution of orders placed.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.revenue_chart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e7" className="dark:stroke-[#232326]" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
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
                <Bar dataKey="orders" fill={theme === 'dark' ? '#ffffff' : '#000000'} radius={[4, 4, 0, 0]} name="Orders Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Customer Signups Line Chart */}
        <div className="clay-card p-6 bg-white dark:bg-[#111113] min-w-0 overflow-hidden">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-slate-500" />
              Client Signup Curve
            </h3>
            <p className="text-[11px] text-slate-400">Cumulative customer database registration velocity.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e7" className="dark:stroke-[#232326]" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
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
                <Line type="monotone" dataKey="registered" stroke={theme === 'dark' ? '#ffffff' : '#000000'} strokeWidth={2.5} activeDot={{ r: 6 }} name="Signups" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Pie Chart Category Allocation */}
        <div className="clay-card p-6 bg-white dark:bg-[#111113] min-w-0 overflow-hidden">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
              <Package className="w-4.5 h-4.5 text-slate-400" />
              Inventory Category Distributions
            </h3>
            <p className="text-[11px] text-slate-400">Catalog representation by department tag.</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-[60%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-[40%] text-xs space-y-1.5 pl-2">
              {categoryChartData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-600 dark:text-slate-400 font-medium truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Activity Log / System events timeline */}
      <div className="clay-card p-6 bg-white dark:bg-[#111113]">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-4.5 h-4.5 text-slate-500" />
          <h3 className="text-sm font-bold text-black dark:text-white">Global Event Log</h3>
        </div>

        <div className="relative border-l border-[#e5e5e7] dark:border-[#232326] ml-3.5 space-y-6">
          {timelineEvents.map((evt) => (
            <div key={evt.id} className="relative pl-7 group">
              {/* Timeline bubble bullet */}
              <span className={`absolute left-[-9px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#111113] flex items-center justify-center shadow-sm ${evt.color}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              </span>

              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                    {evt.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{evt.time}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                  {evt.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

