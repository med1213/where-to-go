import React, { useState } from 'react';
import { adminApi } from '../services/api';
import { Compass, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('Admin@123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await adminApi.login(identifier, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-teal-950 to-teal-900 p-8 text-white text-center">
          <div className="relative w-16 h-16 rounded-2xl bg-white p-1.5 mx-auto mb-3 shadow-lg shadow-teal-950/40 border border-white/20">
            <img src="/logo-v2.png" alt="WhereToGo Laos Main Logo" className="w-full h-full object-contain rounded-xl" />
            <img src="/logo.png" alt="Sub Logo" className="w-5 h-5 rounded-full object-contain absolute -bottom-1 -right-1 border border-white shadow-xs bg-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Where to Go in Laos (ໄປໃສດີ)</h2>
          <p className="text-xs text-teal-200 mt-1 font-lao">
            ລະບົບຈັດການຫລັງບ້ານ • ສໍາລັບຜູ້ດູແລລະບົບ (Admin & Moderator Portal)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 font-lao">
              ຊື່ຜູ້ໃຊ້ ຫຼື ເບີໂທ (Username or Phone)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin or 02099999999"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 font-lao">
              ລະຫັດຜ່ານ (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 transition-all font-lao flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            {isLoading ? 'ກໍາລັງກວດສອບ...' : 'ເຂົ້າສູ່ລະບົບຜູ້ດູແລ (Sign In)'}
          </button>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-stone-400 font-lao">
              Demo Admin Account: <code className="text-stone-700 font-mono">admin / Admin@123456</code>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
