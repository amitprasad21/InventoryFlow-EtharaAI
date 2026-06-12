import React, { useState, useEffect } from 'react';
import { getCustomers, createCustomer, deleteCustomer, type Customer, type CustomerInput } from '../services/customers';
import { useToast } from '../hooks/useToast';
import { 
  Users, Search, Plus, Trash2, X, Loader2, 
  Mail, Phone, Calendar, UserPlus, CreditCard
} from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const { showToast } = useToast();

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers(searchTerm || undefined);
      setCustomers(data);
    } catch (err) {
      console.error(err);
      showToast("Could not load customer accounts", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const openAddModal = () => {
    setName('');
    setEmail('');
    setPhone('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      showToast("Please provide Name and Email", "warning");
      return;
    }

    const inputData: CustomerInput = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined
    };

    try {
      await createCustomer(inputData);
      showToast(`Customer account for '${name}' registered`, 'success');
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || "Failed to create customer.";
      showToast(detail, 'error');
    }
  };

  const handleDelete = async (id: number, custName: string) => {
    if (window.confirm(`Warning: Deleting customer '${custName}' will delete all their order history. Do you wish to proceed?`)) {
      try {
        await deleteCustomer(id);
        showToast(`Customer account '${custName}' deleted`, 'success');
        fetchCustomers();
      } catch (err: any) {
        console.error(err);
        showToast("Failed to delete customer account", 'error');
      }
    }
  };

  return (
    <div className="space-y-6 page-transition">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Customer Database</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage customer records, email directory, and purchase histories.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 gradient-btn text-xs font-semibold cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex bg-white dark:bg-[#1b251a] p-4 rounded-2xl border border-[#e6eae2] dark:border-[#2b3a2a]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-input !pl-10"
            placeholder="Search customers by name, email, or telephone number..."
          />
        </div>
      </div>

      {/* Tabular Directory list */}
      <div className="clay-card bg-white dark:bg-[#111113] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-8 h-8 text-black dark:text-white animate-spin" />
            <p className="text-xs font-medium">Querying customer database...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center border-[#e5e5e7] dark:border-[#232326]">
            <Users className="w-12 h-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-slate-750 dark:text-slate-300 mb-1">No customers registered</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm mx-auto">Click "Add Customer" to sign up your first buyer profile.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e7] dark:border-[#232326]/60 bg-[#f5f5f7]/40 dark:bg-[#18181c]/20">
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-6">Profile</th>
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</th>
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phone</th>
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">Orders Count</th>
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Spend</th>
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Signed Up</th>
                  <th className="p-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e7] dark:divide-[#232326]/60">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#f5f5f7] dark:hover:bg-[#18181c] transition-colors">
                    {/* Profile & Avatar */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-black/5 border border-black/10 text-black dark:bg-white/10 dark:border-white/20 dark:text-white flex items-center justify-center font-bold text-xs">
                          {c.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-black dark:text-white">{c.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {c.email}
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {c.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {c.phone}
                        </div>
                      ) : (
                        <span className="text-slate-350 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Orders count */}
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-400 font-bold text-center">
                      <span className="bg-[#f5f5f7] dark:bg-[#18181c] px-2.5 py-0.5 rounded-full text-black dark:text-white font-bold">
                        {c.orders_count}
                      </span>
                    </td>

                    {/* Total spent */}
                    <td className="p-4 text-xs text-black dark:text-white font-bold">
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-slate-450" />
                        ₹{c.total_spending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* Joined date */}
                    <td className="p-4 text-xs text-slate-405 dark:text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(c.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right pr-6">
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 rounded-lg border border-[#e5e5e7] dark:border-[#232326] text-slate-400 hover:text-[#b91c1c] hover:border-[#fca5a5] dark:text-slate-500 dark:hover:text-rose-400 dark:hover:border-rose-950 transition-colors cursor-pointer"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white dark:bg-[#1b251a] border border-[#e6eae2] dark:border-[#2b3a2a] rounded-3xl w-full max-w-md shadow-2xl relative z-10 p-6 page-transition">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#2b3e2a]/10 text-[#2b3e2a] dark:bg-[#a5bda3]/10 dark:text-[#a5bda3]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">
                  Register Customer Account
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#f3f6f1] dark:hover:bg-[#253224] text-slate-400 hover:text-slate-650 dark:text-slate-400 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="dashboard-input"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="dashboard-input"
                  placeholder="john.doe@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Telephone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="dashboard-input"
                  placeholder="+1 555-0100"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#e6eae2] dark:border-[#2b3a2a]/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#e6eae2] dark:border-[#2b3a2a] text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-[#f3f6f1] dark:hover:bg-[#253224] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gradient-btn text-xs font-semibold cursor-pointer shadow-lg"
                >
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
