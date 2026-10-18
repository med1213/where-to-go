'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  PlusCircle,
  LogOut,
  User as UserIcon,
  Bookmark,
  Shield,
  Menu,
  X,
} from 'lucide-react';

import { Language, translations } from '../../lib/i18n';

interface NavbarProps {
  onOpenSubmit?: () => void;
  onOpenMyPosts?: () => void;
  lang?: Language;
  onLangChange?: (lang: Language) => void;
}

export default function Navbar({
  onOpenSubmit,
  onOpenMyPosts,
  lang = 'lo',
  onLangChange,
}: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const t = translations[lang];

  const toggleLanguage = () => {
    const nextLang: Language = lang === 'lo' ? 'en' : 'lo';
    if (onLangChange) onLangChange(nextLang);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        {/* Brand Logo: Main logo-v2.png with sub logo.png */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex-shrink-0">
            <img
              src="/logo-v2.png"
              alt="Where to Go in Laos Main Logo"
              className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-sm border border-stone-200 group-hover:scale-105 transition-transform"
            />
            <img
              src="/logo.png"
              alt="Sub Logo"
              className="w-4 h-4 rounded-full object-contain absolute -bottom-1 -right-1 border border-white shadow-xs bg-white"
            />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-stone-900 group-hover:text-teal-700 transition-colors block leading-tight">
              Where to Go <span className="text-teal-600 font-bold">in Laos</span>
            </span>
            <span className="text-[11px] font-medium text-stone-400 block tracking-wider">
              ໄປໃສດີ • Travel & Discovery
            </span>
          </div>
        </Link>

        {/* Desktop Nav Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50/80 hover:bg-stone-100 text-xs font-medium transition-all shadow-xs"
            title="Switch language / ປ່ຽນພາສາ"
          >
            <span className={lang === 'lo' ? 'font-bold text-teal-700' : 'text-stone-400'}>🇱🇦 ລາວ</span>
            <span className="text-stone-300">/</span>
            <span className={lang === 'en' ? 'font-bold text-teal-700' : 'text-stone-400'}>🇬🇧 EN</span>
          </button>

          {/* Submit Place CTA */}
          <button
            onClick={onOpenSubmit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 font-medium text-xs border border-teal-200 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-teal-600" />
            {t.navSharePlace}
          </button>

          {isAuthenticated && user && (
            <button
              onClick={onOpenMyPosts}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium text-xs border border-amber-200 transition-all"
            >
              <Bookmark className="w-4 h-4 text-amber-600" />
              {t.navMyPosts}
            </button>
          )}

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-stone-100 border border-stone-200/80 transition-colors text-left"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full object-cover border border-teal-500/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">
                    {user.displayName.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="block text-xs font-semibold text-stone-800 truncate max-w-[120px]">
                    {user.displayName}
                  </span>
                  <span className="block text-[10px] text-teal-700 uppercase font-bold tracking-wider">
                    {user.role}
                  </span>
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-semibold text-stone-900">{user.displayName}</p>
                    <p className="text-[11px] text-stone-500 truncate">
                      {user.username ? `@${user.username}` : user.phoneNumber}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (onOpenMyPosts) onOpenMyPosts();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4 text-amber-600" />
                    {t.navMyPosts}
                  </button>

                  {user.role === 'ADMIN' && (
                    <div className="px-3 py-1.5 text-xs text-amber-700 bg-amber-50 mx-2 my-1 rounded-lg flex items-center gap-1.5 font-medium">
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      Admin Privileges Active
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {t.navLogout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
              >
                {t.navLogin}
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm shadow-teal-700/20 transition-all"
              >
                {t.navRegister}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs text-stone-500 font-medium">Language / ພາສາ:</span>
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold"
            >
              <span className={lang === 'lo' ? 'font-bold text-teal-700' : 'text-stone-400'}>🇱🇦 ລາວ</span>
              <span className="text-stone-300">/</span>
              <span className={lang === 'en' ? 'font-bold text-teal-700' : 'text-stone-400'}>🇬🇧 EN</span>
            </button>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenSubmit) onOpenSubmit();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-semibold shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            {t.navSharePlace}
          </button>

          {isAuthenticated && user && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenMyPosts) onOpenMyPosts();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold"
            >
              <Bookmark className="w-4 h-4 text-amber-600" />
              {t.navMyPosts}
            </button>
          )}

          {isAuthenticated && user ? (
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <div className="flex items-center gap-3 py-2">
                {user.avatarUrl && (
                  <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                )}
                <div>
                  <p className="text-sm font-semibold text-stone-900">{user.displayName}</p>
                  <p className="text-xs text-stone-500">{user.username || user.phoneNumber}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2 text-xs text-rose-600 font-medium flex items-center justify-center gap-1.5 border border-rose-200 rounded-xl hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                {t.navLogout}
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className="py-2.5 text-center text-xs font-semibold text-stone-700 bg-stone-100 rounded-xl"
              >
                {t.navLogin}
              </Link>
              <Link
                href="/register"
                className="py-2.5 text-center text-xs font-semibold text-white bg-teal-600 rounded-xl"
              >
                {t.navRegister}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
