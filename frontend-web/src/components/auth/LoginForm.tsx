'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LoginDto } from '../../types/api';
import { Lock, User, Eye, EyeOff, AlertCircle, Compass } from 'lucide-react';

export default function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both identifier and password.');
      return;
    }

    setIsLoading(true);

    const dto: LoginDto = {
      identifier: identifier.trim(),
      password,
    };

    try {
      await login(dto);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-amber-700 px-8 py-7 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <img
              src="/logo-v2.png"
              alt="Where to Go in Laos Main Logo"
              className="w-12 h-12 rounded-2xl object-contain bg-white/95 p-1 shadow-md border border-white/20"
            />
            <img
              src="/logo.png"
              alt="Sub Logo"
              className="w-4 h-4 rounded-full object-contain absolute -bottom-1 -right-1 border border-white shadow-xs bg-white"
            />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-300 block">
              Where to Go in Laos (ໄປໃສດີ)
            </span>
            <span className="text-[10px] text-teal-100 block">
              Lao Travel & Discovery Community
            </span>
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome Back (ເຂົ້າສູ່ລະບົບ)</h2>
        <p className="text-teal-100 text-xs mt-1">
          Sign in using your Lao phone number or username.
        </p>
      </div>

      <div className="p-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Username or Phone Number
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. admin or 02099999999"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all placeholder:text-stone-400"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Demo login: admin / Admin@123456</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all placeholder:text-stone-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-500">
            Don&apos;t have an account yet?{' '}
            <a href="/register" className="font-semibold text-teal-700 hover:text-teal-800 underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
