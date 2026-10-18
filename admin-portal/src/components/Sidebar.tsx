import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  CheckSquare,
  MapPin,
  Map,
  Users,
  Tag,
  MessageSquare,
  Trash2,
  LogOut,
  Shield,
  Trophy,
  PlusCircle,
  BarChart3,
  Sliders,
} from 'lucide-react';
import { AdminTab } from '../types';

interface SidebarProps {
  pendingCount: number;
  trashCount: number;
  user: any;
  onLogout: () => void;
  onOpenPostPlace?: () => void;
}

export default function Sidebar({
  pendingCount,
  trashCount,
  user,
  onLogout,
  onOpenPostPlace,
}: SidebarProps) {
  const navItems: {
    id: AdminTab;
    path: string;
    labelLo: string;
    labelEn: string;
    icon: any;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      path: '/dashboard',
      labelLo: 'ແດຊບອດ & ລາຍງານ',
      labelEn: 'Dashboard & Reports',
      icon: BarChart3,
    },
    {
      id: 'reviews',
      path: '/reviews',
      labelLo: 'ລໍຖ້າອະນຸມັດ',
      labelEn: 'Review Queue',
      icon: CheckSquare,
      badge: pendingCount,
      badgeColor: 'bg-amber-500 text-stone-950 animate-pulse',
    },
    {
      id: 'places',
      path: '/places',
      labelLo: 'ສະຖານທີ່ທັງໝົດ',
      labelEn: 'Places & Attractions',
      icon: MapPin,
    },
    {
      id: 'rankings',
      path: '/rankings',
      labelLo: 'ຈັດອັນດັບໂພສ (Rank Tier)',
      labelEn: 'Top Post Rank Tiers',
      icon: Trophy,
    },
    {
      id: 'banners',
      path: '/banners',
      labelLo: 'Banner Slider (ໜ້າຫຼັກ)',
      labelEn: 'Hero Banner Slider',
      icon: Sliders,
    },
    {
      id: 'provinces',
      path: '/provinces',
      labelLo: 'ແຂວງ & ເມືອງ (18 ແຂວງ)',
      labelEn: 'Provinces & Districts',
      icon: Map,
    },
    {
      id: 'users',
      path: '/users',
      labelLo: 'ຈັດການຜູ້ໃຊ້ & ສິດທິ',
      labelEn: 'User Management & Roles',
      icon: Users,
    },
    {
      id: 'categories',
      path: '/categories',
      labelLo: 'ໝວດໝູ່ສະຖານທີ່',
      labelEn: 'Categories',
      icon: Tag,
    },
    {
      id: 'comments',
      path: '/comments',
      labelLo: 'ກວດສອບຄອມເມັ້ນ',
      labelEn: 'Comment Moderation',
      icon: MessageSquare,
    },
    {
      id: 'trash',
      path: '/trash',
      labelLo: 'ຖັງຂີ້ເຫຍື້ອ',
      labelEn: 'Trash Bin & Recovery',
      icon: Trash2,
      badge: trashCount,
      badgeColor: 'bg-stone-700 text-stone-300',
    },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-200 flex flex-col justify-between border-r border-stone-800 flex-shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-800/80">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img
                src="/logo-v2.png"
                alt="WhereToGo Laos Main Logo"
                className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-md shadow-teal-900/40 border border-teal-500/30"
              />
              <img
                src="/logo.png"
                alt="Sub Logo"
                className="w-4 h-4 rounded-full object-contain absolute -bottom-1 -right-1 border border-stone-900 shadow-xs bg-white"
              />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white">WhereToGo Laos</h1>
              <p className="text-[11px] text-teal-400 font-medium font-lao">ລະບົບຈັດການຫລັງບ້ານ (Admin)</p>
            </div>
          </div>

          {/* Quick Post Place Button */}
          {onOpenPostPlace && (
            <button
              onClick={onOpenPostPlace}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-teal-900/50 transition-all font-lao"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>ໂພສສະຖານທີ່ໃໝ່ (Post Place)</span>
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-500 font-lao">
            ໂມດູນຄຸ້ມຄອງລະບົບ • Pages
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isTrash = item.id === 'trash';

            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? isTrash
                        ? 'bg-rose-700 text-white shadow-sm shadow-rose-950 font-bold'
                        : 'bg-teal-600 text-white shadow-sm shadow-teal-950 font-bold'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <div className="text-left">
                    <p className="font-lao leading-tight">{item.labelLo}</p>
                    <p className="text-[10px] opacity-70 font-normal">{item.labelEn}</p>
                  </div>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-stone-800 bg-stone-950/40">
        <div className="flex items-center gap-3 mb-3">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="w-9 h-9 rounded-full object-cover border border-teal-500/30"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-teal-900 text-teal-300 flex items-center justify-center text-xs font-bold">
              <Shield className="w-4 h-4" />
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate font-lao">
              {user?.displayName || 'System Admin'}
            </p>
            <p className="text-[10px] text-teal-400 font-semibold tracking-wide">
              ROLE: {user?.role || 'ADMIN'}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors border border-rose-900/30"
        >
          <LogOut className="w-4 h-4" />
          <span>ອອກຈາກລະບົບ (Logout)</span>
        </button>
      </div>
    </aside>
  );
}
