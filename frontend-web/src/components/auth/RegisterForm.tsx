'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { RegisterDto } from '../../types/api';
import {
  User,
  Phone,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Compass,
  Sparkles,
} from 'lucide-react';

const PRESET_AVATARS = [
  {
    label: 'Kuang Si Waterfall Explorer',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
  },
  {
    label: 'Luang Prabang Heritage Backpacker',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  },
  {
    label: 'Vang Vieng Peak Climber',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  },
  {
    label: 'Bolaven Coffee Enthusiast',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
  },
];

export default function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const { register } = useAuth();

  // Mode: 'username' or 'phone' or 'both'
  const [authMode, setAuthMode] = useState<'username' | 'phone'>('username');

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [showPassword, setShowPassword] = useState(false);

  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!displayName.trim()) {
      setErrorMessage('Please enter your full name or nickname.');
      return;
    }

    if (authMode === 'username' && !username.trim()) {
      setErrorMessage('Please enter a username for your traveler account.');
      return;
    }

    if (authMode === 'phone' && !phoneNumber.trim()) {
      setErrorMessage('Please enter your Lao mobile phone number (e.g. 020 5555 1234).');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      return;
    }

    setIsLoading(true);

    const dto: RegisterDto = {
      displayName: displayName.trim(),
      password,
      avatarUrl: selectedAvatar,
      ...(authMode === 'username' ? { username: username.trim().toLowerCase() } : {}),
      ...(authMode === 'phone' ? { phoneNumber: phoneNumber.trim().replace(/\s+/g, '') } : {}),
    };

    try {
      await register(dto);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/');
        }
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200 overflow-hidden">
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-amber-700 px-8 py-7 text-white relative">
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
        <h2 className="text-2xl font-bold tracking-tight">Create Traveler Account (ລົງທະບຽນ)</h2>
        <p className="text-teal-100 text-xs mt-1">
          Post and share waterfalls, cafes, mountain peaks, and cultural spots in Laos.
        </p>
      </div>

      <div className="p-8">
        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">Account created successfully!</p>
              <p className="text-xs text-emerald-600">Redirecting to your exploration feed...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Mode Selector */}
        <div className="flex rounded-xl bg-stone-100 p-1 mb-6 border border-stone-200/70">
          <button
            type="button"
            onClick={() => {
              setAuthMode('username');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'username'
                ? 'bg-white text-teal-800 shadow-sm shadow-stone-300'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <AtSign className="w-3.5 h-3.5" />
            Use Username
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('phone');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'phone'
                ? 'bg-white text-teal-800 shadow-sm shadow-stone-300'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Use Phone Number (Lao)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Full Name or Travel Nickname <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alouny Keomany (ອາລຸນີ)"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Conditional Input: Username or Phone */}
          {authMode === 'username' ? (
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alouny_travel"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all placeholder:text-stone-400"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Unique handle to sign in and credit your submitted places.</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Lao Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 020 5555 1234 or 020 9999 8888"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all placeholder:text-stone-400"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Sign in anytime using your phone number.</p>
            </div>
          )}

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Choose Profile Avatar
            </label>
            <div className="flex items-center gap-3">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedAvatar(av.url)}
                  title={av.label}
                  className={`relative rounded-full p-0.5 transition-all ${
                    selectedAvatar === av.url
                      ? 'ring-2 ring-teal-600 scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={av.url}
                    alt={av.label}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  />
                  {selectedAvatar === av.url && (
                    <span className="absolute -bottom-1 -right-1 bg-teal-600 rounded-full p-0.5 text-white">
                      <Sparkles className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating your account...
              </>
            ) : (
              'Join WhereToGo Laos'
            )}
          </button>
        </form>

        {/* Footer switcher */}
        <div className="mt-6 pt-6 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-500">
            Already have an account?{' '}
            <a href="/login" className="font-semibold text-teal-700 hover:text-teal-800 underline">
              Sign In with Username or Phone
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
