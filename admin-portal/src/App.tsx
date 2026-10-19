import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import ReviewQueue from './components/ReviewQueue';
import PlacesList from './components/PlacesList';
import ProvincesManagement from './components/ProvincesManagement';
import UserManagement from './components/UserManagement';
import CategoryManagement from './components/CategoryManagement';
import CommentModeration from './components/CommentModeration';
import TrashBin from './components/TrashBin';
import RejectModal from './components/RejectModal';
import AdminLogin from './components/AdminLogin';
import RankTierLeaderboard from './components/RankTierLeaderboard';
import AdminCreatePlaceModal from './components/AdminCreatePlaceModal';
import DashboardReporting from './components/DashboardReporting';
import BannerManagement from './components/BannerManagement';
import { adminApi, authStorage } from './services/api';
import { AdminStats, Place, TrashData } from './types';
import { RefreshCw, PlusCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(authStorage.getUser());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('wtg_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('wtg_sidebar_collapsed', String(next));
      return next;
    });
  };

  const location = useLocation();
  const navigate = useNavigate();

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingPlaces, setPendingPlaces] = useState<Place[]>([]);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [trashData, setTrashData] = useState<TrashData | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [rejectingPlace, setRejectingPlace] = useState<Place | null>(null);
  const [isCreatePlaceOpen, setIsCreatePlaceOpen] = useState(false);

  const fetchDashboardData = async (forceRefresh = false) => {
    if (forceRefresh) {
      adminApi.clearCache();
    }
    setIsLoading(true);
    try {
      // 1. Always fetch stats (lightweight aggregated metric for top cards & sidebar)
      const statsRes = await adminApi.getStats().catch(() => null);
      if (statsRes) setStats(statsRes);

      // 2. Fetch specific module data on-demand based on active route
      const currentPath = location.pathname;

      if (currentPath === '/dashboard' || currentPath === '/places' || currentPath === '/') {
        const placesRes = await adminApi
          .getAllPlaces(selectedProvince)
          .catch(() => ({ items: [], meta: {} }));
        if (placesRes) setAllPlaces(placesRes.items);
      }

      if (currentPath === '/reviews') {
        const pendingRes = await adminApi
          .getPendingPlaces()
          .catch(() => ({ items: [], meta: {} }));
        if (pendingRes) setPendingPlaces(pendingRes.items);
      }

      if (currentPath === '/trash') {
        const trashRes = await adminApi.getTrash().catch(() => null);
        if (trashRes) setTrashData(trashRes);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData(false);
    }
  }, [user, selectedProvince, location.pathname]);

  const handleLogout = () => {
    authStorage.clearToken();
    localStorage.removeItem('wtg_admin_user');
    setUser(null);
  };

  if (!user) {
    return (
      <AdminLogin
        onLoginSuccess={(u) => {
          setUser(u);
          navigate('/dashboard');
        }}
      />
    );
  }

  const getHeaderTitle = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return 'ແດຊບອດ ແລະ ລາຍງານສະຖິຕິການທ່ອງທ່ຽວ (Executive Dashboard & Reports)';
      case '/reviews':
        return 'ກວດສອບສະຖານທີ່ລໍຖ້າອະນຸມັດ (Review Queue)';
      case '/places':
        return 'ລາຍການສະຖານທີ່ທ່ອງທ່ຽວ (Places & Attractions)';
      case '/rankings':
        return 'ອັນດັບໂພສຍອດນິຍົມຕາມລະດັບ (Top Post Rank Tiers: S / A / B / C)';
      case '/banners':
        return 'ຈັດການ Banner Slider ໜ້າທຳອິດ (Hero Banner Slider Modules)';
      case '/provinces':
        return 'ຈັດການແຂວງ & ເມືອງ 18 ແຂວງ (Provinces & Districts of Laos)';
      case '/users':
        return 'ຈັດການບັນຊີສະມາຊິກ & ສິດທິ (User & Role Management)';
      case '/categories':
        return 'ຈັດການໝວດໝູ່ສະຖານທີ່ (Travel Categories)';
      case '/comments':
        return 'ກວດສອບ ແລະ ຈັດການຄອມເມັ້ນ (Comment Moderation)';
      case '/trash':
        return 'ຖັງຂີ້ເຫຍື້ອລະບົບ (Trash Bin & Soft Delete Recovery)';
      default:
        return 'ລະບົບຈັດການຫລັງບ້ານ (WhereToGo Admin Portal)';
    }
  };

  return (
    <div className="flex h-screen bg-[#FBFBFA] overflow-hidden text-stone-900 font-lao">
      {/* Sidebar Navigation with React Router NavLinks */}
      <Sidebar
        pendingCount={pendingPlaces.length}
        trashCount={trashData?.totalCount || 0}
        user={user}
        onLogout={handleLogout}
        onOpenPostPlace={() => setIsCreatePlaceOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-stone-200 px-6 sm:px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'ຂະຫຍາຍເມນູ (Expand Sidebar)' : 'ຫຍໍ້ເມນູ (Collapse Sidebar)'}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-teal-600" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
            <div>
              <h1 className="text-base font-bold text-stone-900">
                {getHeaderTitle(location.pathname)}
              </h1>
              <p className="text-[11px] text-stone-400">
                WhereToGo Laos Full Administration Suite • React Router & Noto Sans Lao
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Post Place Button */}
            <button
              onClick={() => setIsCreatePlaceOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Post a Place (Admin)</span>
            </button>

            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isLoading}
              title="Refresh Data (Force Fetch)"
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            </button>
            <div className="hidden sm:block px-3 py-1 bg-teal-50 text-teal-800 rounded-full border border-teal-200 text-xs font-semibold">
              PS512 JWT Auth Active
            </div>
          </div>
        </header>

        {/* Scrollable View */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {/* Top Metric Cards - only show on non-dashboard subpages to avoid duplicate static cards */}
          {location.pathname !== '/dashboard' && location.pathname !== '/' && (
            <StatsCards stats={stats} />
          )}

          {/* Full React Router Switcher */}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <DashboardReporting
                  stats={stats}
                  places={allPlaces}
                  pendingPlaces={pendingPlaces}
                />
              }
            />
            <Route
              path="/reviews"
              element={
                <ReviewQueue
                  places={pendingPlaces}
                  onRefresh={fetchDashboardData}
                  onOpenRejectModal={(p) => setRejectingPlace(p)}
                />
              }
            />
            <Route
              path="/places"
              element={
                <PlacesList
                  places={allPlaces}
                  onRefresh={fetchDashboardData}
                  selectedProvince={selectedProvince}
                  onSelectProvince={(prov) => setSelectedProvince(prov)}
                />
              }
            />
            <Route path="/rankings" element={<RankTierLeaderboard />} />
            <Route
              path="/banners"
              element={<BannerManagement places={allPlaces} />}
            />
            <Route path="/provinces" element={<ProvincesManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/comments" element={<CommentModeration />} />
            <Route
              path="/trash"
              element={<TrashBin trash={trashData} onRefresh={fetchDashboardData} />}
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-stone-200 py-3 px-8 text-center text-xs text-stone-500 flex-shrink-0">
          <p className="font-semibold text-stone-800">
            Copyright © {new Date().getFullYear()} Make by Med newbie DEV. All rights reserved.
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Use for advertise Laos country to the world who wanna visit Laos and grow Laos business :)
          </p>
        </footer>
      </div>

      {/* Reject Modal */}
      <RejectModal
        place={rejectingPlace}
        onClose={() => setRejectingPlace(null)}
        onSuccess={fetchDashboardData}
      />

      {/* Admin Post Place Modal */}
      <AdminCreatePlaceModal
        isOpen={isCreatePlaceOpen}
        onClose={() => setIsCreatePlaceOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
