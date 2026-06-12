import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { Lock, Mail, Loader2, Warehouse } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post<{ access_token: string }>('/auth/login', {
        email,
        password,
      });
      await login(response.data.access_token);
      showToast('Welcome back to InventoryFlow AI!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Invalid email or password';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f4f6] dark:bg-[#050507] p-4 relative overflow-hidden transition-colors duration-300">
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-black/5 dark:bg-white/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-black/5 dark:bg-white/5 blur-[120px] pointer-events-none" />
 
      <div className="w-full max-w-md page-transition">
        {/* Logo banner */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-black dark:bg-white rounded-2xl shadow-lg mb-3">
            <Warehouse className="w-8 h-8 text-white dark:text-black" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-black to-[#232326] dark:from-white dark:to-slate-350 bg-clip-text text-transparent">
            InventoryFlow AI
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Enterprise Inventory & Order Management
          </p>
        </div>
 
        {/* Login Glass Card */}
        <div className="clay-card p-8 bg-white dark:bg-[#111113]">
          <h2 className="text-xl font-bold text-black dark:text-white mb-6">
            Sign in to Dashboard
          </h2>
 
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-505 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-450" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="dashboard-input !pl-10"
                  placeholder="admin@inventoryflow.ai"
                  required
                />
              </div>
            </div>
 
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-505 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-450" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dashboard-input !pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
 
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full gradient-btn flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
 
          {/* Credentials Helper */}
          <div className="mt-8 pt-6 border-t border-[#e5e5e7] dark:border-[#232326] text-center">
            <p className="text-xs text-slate-405 dark:text-slate-500 font-bold mb-2">
              ASSESSMENT TESTING CREDENTIALS
            </p>
            <div className="inline-block bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-left">
              <p className="text-xs text-black dark:text-white">
                <span className="font-semibold">Email:</span> admin@inventoryflow.ai
              </p>
              <p className="text-xs text-black dark:text-white">
                <span className="font-semibold">Password:</span> admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
