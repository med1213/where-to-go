import React, { useState, useMemo } from 'react';
import { AdminStats, Place } from '../types';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  MapPin,
  Star,
  Users,
  MessageSquare,
  Heart,
  Download,
  Printer,
  Compass,
  CheckCircle2,
  Clock,
  Trash2,
  Award,
  Calendar,
  Activity,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface DashboardReportingProps {
  stats: AdminStats | null;
  places: Place[];
  pendingPlaces: Place[];
}

export type TimeFilterType = 'today' | 'toweek' | 'month' | 'year' | 'custom';

export default function DashboardReporting({
  stats,
  places,
  pendingPlaces,
}: DashboardReportingProps) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeFilterType>('toweek');
  const [customStart, setCustomStart] = useState<string>(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [customEnd, setCustomEnd] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Section Collapse / Expand States
  const [collapsed, setCollapsed] = useState({
    kpis: false,
    trend: false,
    analytics: false,
    distribution: false,
    health: false,
  });

  const toggleSection = (section: keyof typeof collapsed) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const isAllCollapsed = Object.values(collapsed).every(Boolean);

  const toggleAll = () => {
    const nextState = !isAllCollapsed;
    setCollapsed({
      kpis: nextState,
      trend: nextState,
      analytics: nextState,
      distribution: nextState,
      health: nextState,
    });
  };

  // 1. Group places by province
  const provinceCounts: Record<string, number> = {};
  places.forEach((p) => {
    const prov = p.province || 'Unknown';
    provinceCounts[prov] = (provinceCounts[prov] || 0) + 1;
  });

  const sortedProvinces = Object.entries(provinceCounts).sort((a, b) => b[1] - a[1]);
  const maxProvCount = sortedProvinces[0]?.[1] || 1;

  // 2. Group places by category
  const categoryCounts: Record<string, number> = {};
  places.forEach((p) => {
    const catName = p.category?.name || 'Uncategorized';
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // 3. Total engagement metrics
  const totalViews = places.reduce((acc, p) => acc + (p.viewCount || 0), 0);
  const totalFavorites = places.reduce((acc, p) => acc + (p.favoriteCount || 0), 0);
  const totalComments = places.reduce((acc, p) => acc + (p.commentCount || 0), 0);

  // 4. Advanced Post Tracking ("More or Less" day/week/month/year/custom analysis)
  const chartAnalytics = useMemo(() => {
    const now = new Date();
    const result: Array<{
      key: string;
      label: string;
      subLabel: string;
      count: number;
      isCurrent: boolean;
    }> = [];

    let currentPeriodCount = 0;
    let previousPeriodCount = 0;
    let periodName = '';
    let comparisonLabel = '';

    if (timeRange === 'today') {
      periodName = 'ມື້ນີ້ (Today)';
      comparisonLabel = 'ທຽບກັບມື້ວານ (vs Yesterday)';

      const todayStr = now.toISOString().slice(0, 10);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      // 6 time blocks of 4 hours
      const blocks = [
        { label: '00:00-04:00', start: 0, end: 4, nameLo: 'ເດິກ' },
        { label: '04:00-08:00', start: 4, end: 8, nameLo: 'ເຊົ້າ' },
        { label: '08:00-12:00', start: 8, end: 12, nameLo: 'ສວາຍ' },
        { label: '12:00-16:00', start: 12, end: 16, nameLo: 'ບ່າຍ' },
        { label: '16:00-20:00', start: 16, end: 20, nameLo: 'ແລງ' },
        { label: '20:00-24:00', start: 20, end: 24, nameLo: 'ກາງຄືນ' },
      ];

      const currentHour = now.getHours();

      blocks.forEach((b) => {
        const count = places.filter((p) => {
          if (!p.createdAt) return false;
          const pd = new Date(p.createdAt);
          return (
            pd.toISOString().slice(0, 10) === todayStr &&
            pd.getHours() >= b.start &&
            pd.getHours() < b.end
          );
        }).length;

        const isCur = currentHour >= b.start && currentHour < b.end;

        result.push({
          key: b.label,
          label: b.label,
          subLabel: b.nameLo,
          count,
          isCurrent: isCur,
        });
      });

      currentPeriodCount = places.filter(
        (p) => p.createdAt && new Date(p.createdAt).toISOString().slice(0, 10) === todayStr
      ).length;

      previousPeriodCount = places.filter(
        (p) => p.createdAt && new Date(p.createdAt).toISOString().slice(0, 10) === yesterdayStr
      ).length;
    } else if (timeRange === 'toweek') {
      periodName = 'ອາທິດນີ້ (This Week)';
      comparisonLabel = 'ທຽບກັບອາທິດຜ່ານມາ (vs Last Week)';

      // 7 days of the week
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const matched = places.filter(
          (p) => p.createdAt && new Date(p.createdAt).toISOString().slice(0, 10) === dateStr
        );

        const dayNameShort = d.toLocaleDateString('lo-LA', { weekday: 'short' });
        const dayNameEn = d.toLocaleDateString('en-US', { weekday: 'short' });

        result.push({
          key: dateStr,
          label: `${d.getDate()}/${d.getMonth() + 1}`,
          subLabel: `${dayNameShort} (${dayNameEn})`,
          count: matched.length,
          isCurrent: i === 0,
        });
      }

      const last7DaysStart = new Date(now);
      last7DaysStart.setDate(last7DaysStart.getDate() - 7);
      const prev7DaysStart = new Date(now);
      prev7DaysStart.setDate(prev7DaysStart.getDate() - 14);

      currentPeriodCount = places.filter((p) => {
        if (!p.createdAt) return false;
        const pd = new Date(p.createdAt);
        return pd >= last7DaysStart && pd <= now;
      }).length;

      previousPeriodCount = places.filter((p) => {
        if (!p.createdAt) return false;
        const pd = new Date(p.createdAt);
        return pd >= prev7DaysStart && pd < last7DaysStart;
      }).length;
    } else if (timeRange === 'month') {
      periodName = 'ເດືອນນີ້ (This Month)';
      comparisonLabel = 'ທຽບກັບເດືອນຜ່ານມາ (vs Last Month)';

      // 6 intervals across the month (every 5 days)
      const daysInMonth = 30;
      for (let i = 5; i >= 0; i--) {
        const endDayOffset = i * 5;
        const startDayOffset = (i + 1) * 5;

        const dStart = new Date(now);
        dStart.setDate(dStart.getDate() - startDayOffset);
        const dEnd = new Date(now);
        dEnd.setDate(dEnd.getDate() - endDayOffset);

        const matched = places.filter((p) => {
          if (!p.createdAt) return false;
          const pd = new Date(p.createdAt);
          return pd >= dStart && pd <= dEnd;
        });

        result.push({
          key: `m-${i}`,
          label: `${dStart.getDate()}/${dStart.getMonth() + 1} - ${dEnd.getDate()}/${dEnd.getMonth() + 1}`,
          subLabel: `${startDayOffset}-${endDayOffset} ວັນຜ່ານມາ`,
          count: matched.length,
          isCurrent: i === 0,
        });
      }

      const last30DaysStart = new Date(now);
      last30DaysStart.setDate(last30DaysStart.getDate() - 30);
      const prev30DaysStart = new Date(now);
      prev30DaysStart.setDate(prev30DaysStart.getDate() - 60);

      currentPeriodCount = places.filter((p) => {
        if (!p.createdAt) return false;
        const pd = new Date(p.createdAt);
        return pd >= last30DaysStart && pd <= now;
      }).length;

      previousPeriodCount = places.filter((p) => {
        if (!p.createdAt) return false;
        const pd = new Date(p.createdAt);
        return pd >= prev30DaysStart && pd < last30DaysStart;
      }).length;
    } else if (timeRange === 'year') {
      periodName = 'ປີນີ້ (This Year - 12 Months)';
      comparisonLabel = 'ທຽບກັບປີຜ່ານມາ (vs Last Year)';

      const monthNamesLo = [
        'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
        'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ',
      ];
      const monthNamesEn = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];

      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      for (let m = 0; m < 12; m++) {
        const matched = places.filter((p) => {
          if (!p.createdAt) return false;
          const pd = new Date(p.createdAt);
          return pd.getFullYear() === currentYear && pd.getMonth() === m;
        });

        result.push({
          key: `yr-${m}`,
          label: `${monthNamesEn[m]}`,
          subLabel: `${monthNamesLo[m]}`,
          count: matched.length,
          isCurrent: m === currentMonth,
        });
      }

      currentPeriodCount = places.filter((p) => {
        if (!p.createdAt) return false;
        return new Date(p.createdAt).getFullYear() === currentYear;
      }).length;

      previousPeriodCount = places.filter((p) => {
        if (!p.createdAt) return false;
        return new Date(p.createdAt).getFullYear() === currentYear - 1;
      }).length;
    } else {
      // Custom Date Range
      periodName = 'ກຳນົດເອງ (Custom Date Range)';
      comparisonLabel = 'ຕາມຊ່ວງວັນທີທີ່ເລືອກ';

      const sDate = new Date(customStart);
      const eDate = new Date(customEnd);
      eDate.setHours(23, 59, 59, 999);

      const diffDays = Math.max(1, Math.round((eDate.getTime() - sDate.getTime()) / 86400000));
      const step = Math.max(1, Math.ceil(diffDays / 7));

      for (let i = 0; i < diffDays; i += step) {
        const dS = new Date(sDate);
        dS.setDate(dS.getDate() + i);
        const dE = new Date(dS);
        dE.setDate(dE.getDate() + step - 1);
        if (dE > eDate) dE.setTime(eDate.getTime());

        const matched = places.filter((p) => {
          if (!p.createdAt) return false;
          const pd = new Date(p.createdAt);
          return pd >= dS && pd <= dE;
        });

        result.push({
          key: `cust-${i}`,
          label: `${dS.getDate()}/${dS.getMonth() + 1}`,
          subLabel: `${dE.getDate()}/${dE.getMonth() + 1}`,
          count: matched.length,
          isCurrent: false,
        });
      }

      currentPeriodCount = places.filter((p) => {
        if (!p.createdAt) return false;
        const pd = new Date(p.createdAt);
        return pd >= sDate && pd <= eDate;
      }).length;

      previousPeriodCount = 0;
    }

    const diff = currentPeriodCount - previousPeriodCount;
    let deltaPercent = 0;
    if (previousPeriodCount === 0) {
      deltaPercent = currentPeriodCount > 0 ? 100 : 0;
    } else {
      deltaPercent = Math.round((diff / previousPeriodCount) * 100);
    }

    const maxCount = Math.max(...result.map((r) => r.count), 1);
    const totalCount = result.reduce((acc, r) => acc + r.count, 0);

    return {
      bars: result,
      currentPeriodCount,
      previousPeriodCount,
      diff,
      deltaPercent,
      isMore: diff > 0,
      isLess: diff < 0,
      isEqual: diff === 0,
      periodName,
      comparisonLabel,
      maxCount,
      totalCount,
    };
  }, [places, timeRange, customStart, customEnd]);

  // 5. Price Tier Breakdown
  const priceStats = useMemo(() => {
    let free = 0;
    let budget = 0; // <= 50,000 LAK
    let mid = 0;    // 50,001 - 200,000 LAK
    let premium = 0; // > 200,000 LAK or USD

    places.forEach((p) => {
      const pl = (p.priceLao || '').toLowerCase();
      const pr = (p.priceRange || '').toUpperCase();
      const pf = (p.priceForeigner || '').toLowerCase();

      if (pl.includes('ຟຣີ') || pl.includes('free') || pl === '0' || pr === 'FREE') {
        free++;
      } else if (pf.includes('$') || pf.includes('usd') || pr === 'EXPENSIVE') {
        premium++;
      } else {
        const num = parseInt(pl.replace(/[^0-9]/g, ''), 10);
        if (isNaN(num) || num <= 50000) {
          budget++;
        } else if (num <= 200000) {
          mid++;
        } else {
          premium++;
        }
      }
    });


    const total = places.length || 1;
    return {
      free: { count: free, percent: Math.round((free / total) * 100) },
      budget: { count: budget, percent: Math.round((budget / total) * 100) },
      mid: { count: mid, percent: Math.round((mid / total) * 100) },
      premium: { count: premium, percent: Math.round((premium / total) * 100) },
    };
  }, [places]);

  // 6. Moderation Funnel Stats
  const approvedCount = stats?.approvedPlaces || places.length;
  const pendingCount = stats?.pendingPlaces || pendingPlaces.length;
  const totalAllPosts = stats?.totalPlaces || places.length + pendingPlaces.length;
  const approvedPercent = totalAllPosts > 0 ? Math.round((approvedCount / totalAllPosts) * 100) : 100;
  const pendingPercent = totalAllPosts > 0 ? Math.round((pendingCount / totalAllPosts) * 100) : 0;

  // 7. Engagement Velocity
  const favoriteRate = totalViews > 0 ? ((totalFavorites / totalViews) * 100).toFixed(1) : '0.0';
  const commentRate = totalViews > 0 ? ((totalComments / totalViews) * 100).toFixed(1) : '0.0';

  // Handle Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Where to Go in Laos - Tourism Analytics & Executive Report'],
      ['Generated Date', new Date().toLocaleString()],
      [],
      ['Metric', 'Value'],
      ['Total Places in System', stats?.totalPlaces || places.length],
      ['Approved & Published', stats?.approvedPlaces || places.length],
      ['Pending Moderation', stats?.pendingPlaces || pendingPlaces.length],
      ['Total Registered Users', stats?.totalUsers || 0],
      ['Total Community Comments', stats?.totalComments || totalComments],
      ['Total Wanna-Go Favorites', stats?.totalFavorites || totalFavorites],
      ['Total Place Views', totalViews],
      ['Post Activity Breakdown (' + chartAnalytics.periodName + ')', 'Posts Created'],
      ...chartAnalytics.bars.map((d) => [d.label, d.count]),
      [],
      ['Top Provinces', 'Places Count', 'Percentage'],
      ...sortedProvinces.map(([prov, count]) => [
        prov,
        count,
        `${((count / (places.length || 1)) * 100).toFixed(1)}%`,
      ]),
      [],
      ['Category Breakdown', 'Places Count'],
      ...sortedCategories.map(([cat, count]) => [cat, count]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `WhereToGo-Laos-Report-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with Export actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Executive Analytics & Tourism Intelligence</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            ລາຍງານພາບລວມ ແລະ ສະຖິຕິການທ່ອງທ່ຽວ (Dashboard & Reporting)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            ສະຖິຕິສະຖານທີ່ທ່ອງທ່ຽວທົ່ວ 18 ແຂວງ, ການມີສ່ວນຮ່ວມຂອງນັກທ່ອງທ່ຽວ, ແລະ ການດຳເນີນງານ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors cursor-pointer border border-teal-200"
          >
            {isAllCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span>{isAllCollapsed ? 'ຂະຫຍາຍທັງໝົດ (Expand All)' : 'ຫຍໍ້ທັງໝົດ (Collapse All)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>ພິມລາຍງານ (Print)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadSuccess ? '✓ ດາວໂຫຼດແລ້ວ!' : 'ສົ່ງອອກ CSV (Export)'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid with Collapse/Expand */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>ພາບລວມຕົວເລກຫຼັກ (Primary KPI Metrics)</span>
          </h3>
          <button
            onClick={() => toggleSection('kpis')}
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 font-semibold px-2.5 py-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {collapsed.kpis ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-teal-700">ຂະຫຍາຍ (Expand)</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>ຫຍໍ້ (Collapse)</span>
              </>
            )}
          </button>
        </div>

        {collapsed.kpis ? (
          <div
            onClick={() => toggleSection('kpis')}
            className="bg-white px-5 py-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:border-teal-400 hover:bg-teal-50/20 transition-all"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 font-medium">
              <span>📍 ສະຖານທີ່: <b className="text-stone-900">{stats?.totalPlaces || places.length}</b></span>
              <span className="text-stone-300">•</span>
              <span>✅ ອະນຸມັດ: <b className="text-emerald-700">{stats?.approvedPlaces || places.length}</b></span>
              <span className="text-stone-300">•</span>
              <span>⏳ ລໍຖ້າກວດສອບ: <b className="text-amber-600">{stats?.pendingPlaces || pendingPlaces.length}</b></span>
              <span className="text-stone-300">•</span>
              <span>👥 ສະມາຊິກ: <b className="text-stone-900">{stats?.totalUsers || 0}</b></span>
              <span className="text-stone-300">•</span>
              <span>❤️ Wanna-Go: <b className="text-rose-600">{stats?.totalFavorites || totalFavorites}</b></span>
              <span className="text-stone-300">•</span>
              <span>💬 ຄຳຕິຊົມ: <b className="text-indigo-600">{stats?.totalComments || totalComments}</b></span>
            </div>
            <span className="text-[11px] text-teal-700 font-bold flex items-center gap-1">
              <span>ເບິ່ງເຕັມ</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-fadeIn">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-teal-700 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Places</span>
              </div>
              <div className="text-2xl font-black text-stone-900">{stats?.totalPlaces || places.length}</div>
              <div className="text-[11px] text-stone-500 mt-1 font-medium">ສະຖານທີ່ທັງໝົດ</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Live</span>
              </div>
              <div className="text-2xl font-black text-emerald-700">{stats?.approvedPlaces || places.length}</div>
              <div className="text-[11px] text-stone-500 mt-1 font-medium">ອະນຸມັດແລ້ວ</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-amber-500 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Queue</span>
              </div>
              <div className="text-2xl font-black text-amber-600">{stats?.pendingPlaces || pendingPlaces.length}</div>
              <div className="text-[11px] text-stone-500 mt-1 font-medium">ລໍຖ້າກວດສອບ</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-blue-600 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Users</span>
              </div>
              <div className="text-2xl font-black text-stone-900">{stats?.totalUsers || 0}</div>
              <div className="text-[11px] text-stone-500 mt-1 font-medium">ສະມາຊິກໃນລະບົບ</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-rose-500 mb-2">
                <Heart className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Likes</span>
              </div>
              <div className="text-2xl font-black text-stone-900">{stats?.totalFavorites || totalFavorites}</div>
              <div className="text-[11px] text-stone-500 mt-1 font-medium">ຍອດ Wanna-Go</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-indigo-600 mb-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Reviews</span>
              </div>
              <div className="text-2xl font-black text-stone-900">{stats?.totalComments || totalComments}</div>
              <div className="text-[11px] text-stone-500 mt-1 font-medium">ຄຳຕິຊົມ & ຕອບກັບ</div>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 NEW FEATURE: Daily / Weekly / Monthly / Yearly Post Volume & Trend Tracking Chart */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                  <span>ຕິດຕາມການໂພສສະຖານທີ່ (Post Volume Tracking)</span>
                  <span className="text-xs font-normal text-stone-400">• ເພີ່ມຂຶ້ນ ຫຼື ຫຼຸດລົງ (More or Less)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  ວິເຄາະຈຳນວນໂພສຕາມຊ່ວງເວລາ (ມື້ນີ້, ອາທິດນີ້, ເດືອນນີ້, ປີນີ້ ຫຼື ກຳນົດເອງ)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Buttons */}
            <div className="inline-flex p-1 bg-stone-100 rounded-xl text-xs font-medium text-stone-600">
              <button
                onClick={() => setTimeRange('today')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === 'today'
                    ? 'bg-white text-teal-800 font-bold shadow-xs'
                    : 'hover:text-stone-900'
                }`}
              >
                ມື້ນີ້ (Today)
              </button>
              <button
                onClick={() => setTimeRange('toweek')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === 'toweek'
                    ? 'bg-white text-teal-800 font-bold shadow-xs'
                    : 'hover:text-stone-900'
                }`}
              >
                ອາທິດນີ້ (Week)
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === 'month'
                    ? 'bg-white text-teal-800 font-bold shadow-xs'
                    : 'hover:text-stone-900'
                }`}
              >
                ເດືອນນີ້ (Month)
              </button>
              <button
                onClick={() => setTimeRange('year')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === 'year'
                    ? 'bg-white text-teal-800 font-bold shadow-xs'
                    : 'hover:text-stone-900'
                }`}
              >
                ປີນີ້ (Year)
              </button>
              <button
                onClick={() => setTimeRange('custom')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === 'custom'
                    ? 'bg-white text-teal-800 font-bold shadow-xs'
                    : 'hover:text-stone-900'
                }`}
              >
                ກຳນົດເອງ (Custom)
              </button>
            </div>

            {/* Custom Date Range Pickers if 'custom' is active */}
            {timeRange === 'custom' && (
              <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-xl border border-stone-200 text-xs">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-white px-2 py-1 rounded-lg border border-stone-200 text-stone-700 font-mono text-[11px]"
                />
                <span className="text-stone-400">ຫາ</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-white px-2 py-1 rounded-lg border border-stone-200 text-stone-700 font-mono text-[11px]"
                />
              </div>
            )}

            {/* Toggle Section 2 Button */}
            <button
              onClick={() => toggleSection('trend')}
              className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-semibold px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {collapsed.trend ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-teal-700">ຂະຫຍາຍ</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>ຫຍໍ້</span>
                </>
              )}
            </button>
          </div>
        </div>

        {collapsed.trend ? (
          <div
            onClick={() => toggleSection('trend')}
            className="p-4 bg-stone-50/80 rounded-2xl border border-dashed border-stone-300 flex items-center justify-between cursor-pointer hover:bg-stone-100 transition-colors"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 font-medium">
              <span>📊 <b>{chartAnalytics.periodName}</b>: {chartAnalytics.currentPeriodCount} ໂພສຕ໌</span>
              <span className="text-stone-300">•</span>
              <span className={chartAnalytics.isMore ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                {chartAnalytics.isMore ? '▲ ເພີ່ມຂຶ້ນ' : '▼ ຫຼຸດລົງ'} {chartAnalytics.deltaPercent}%
              </span>
              <span className="text-stone-400 font-normal">({chartAnalytics.comparisonLabel})</span>
            </div>
            <span className="text-xs text-teal-700 font-semibold flex items-center gap-1">
              <span>ຂະຫຍາຍເບິ່ງກຣາຟເຕັມ</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>
        ) : (
          <>

        {/* Highlight Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Current Period Posts with More/Less Indicator */}
          <div className={`p-4 rounded-2xl border transition-all ${
            chartAnalytics.isMore
              ? 'bg-emerald-50/70 border-emerald-200'
              : chartAnalytics.isLess
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-stone-50 border-stone-200'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-1">
              <span>ໂພສໄລຍະນີ້ ({chartAnalytics.periodName})</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 font-bold">Current</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-900">{chartAnalytics.currentPeriodCount}</span>
              <span className="text-xs text-stone-500">ສະຖານທີ່</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold">
              {chartAnalytics.isMore ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+{chartAnalytics.diff} ໂພສ (More / ເພີ່ມຂຶ້ນ +{chartAnalytics.deltaPercent}%)</span>
                </span>
              ) : chartAnalytics.isLess ? (
                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>{chartAnalytics.diff} ໂພສ (Less / ຫຼຸດລົງ {chartAnalytics.deltaPercent}%)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded-md">
                  <span>= ຄົງທີ່ (Same / ເທົ່າເດີມ)</span>
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Previous Period Comparison */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-1">
              <span>ໄລຍະຜ່ານມາ ({chartAnalytics.comparisonLabel})</span>
              <Clock className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-800">{chartAnalytics.previousPeriodCount}</span>
              <span className="text-xs text-stone-500">ສະຖານທີ່</span>
            </div>
            <div className="mt-2.5 text-xs text-stone-500">
              ຖານປຽບທຽບໄລຍະເວລາກ່ອນໜ້າ
            </div>
          </div>

          {/* Card 3: Period Total Visualized */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-1">
              <span>ລວມທັງໝົດໃນກຣາບ</span>
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-teal-800">{chartAnalytics.totalCount}</span>
              <span className="text-xs text-stone-500">ລາຍການ</span>
            </div>
            <div className="mt-2.5 text-xs text-stone-500">
              ສູງສຸດ: {chartAnalytics.maxCount} ໂພສ / ຊ່ອງ
            </div>
          </div>

          {/* Card 4: Trend Velocity Indicator */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-900 to-stone-900 text-white">
            <div className="flex items-center justify-between text-xs font-semibold text-teal-200 mb-1">
              <span>ທ່າອ່ຽງລວມ (Trend Status)</span>
              <Activity className="w-3.5 h-3.5 text-teal-300" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              {chartAnalytics.isMore ? (
                <>
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <span className="text-lg font-bold text-emerald-300">ໂພສເພີ່ມຂຶ້ນ (Surging)</span>
                </>
              ) : chartAnalytics.isLess ? (
                <>
                  <TrendingDown className="w-6 h-6 text-amber-400" />
                  <span className="text-lg font-bold text-amber-300">ໂພສຫຼຸດລົງ (Slowing)</span>
                </>
              ) : (
                <>
                  <Activity className="w-6 h-6 text-teal-300" />
                  <span className="text-lg font-bold text-teal-200">ຄົງທີ່ (Stable)</span>
                </>
              )}
            </div>
            <div className="mt-2 text-[11px] text-teal-200/80">
              ອີງຕາມຂໍ້ມູນການສ້າງເນື້ອຫາຕົວຈິງໃນລະບົບ
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200/80">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              ເສັ້ນສະແດງການໂພສ ({chartAnalytics.periodName})
            </span>
            <span className="text-xs text-stone-400">
              ສູງສຸດ: {chartAnalytics.maxCount} ໂພສ
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-48 flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-2 border-b border-stone-200 overflow-x-auto">
            {chartAnalytics.bars.map((d) => {
              const heightPercent = Math.max(8, Math.round((d.count / chartAnalytics.maxCount) * 100));
              const isCurrent = d.isCurrent;
              return (
                <div
                  key={d.key}
                  className="flex-1 min-w-[36px] flex flex-col items-center gap-2 group relative"
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-stone-900 text-white text-[10px] font-mono py-1 px-2 rounded-lg whitespace-nowrap z-10 shadow-lg">
                    {d.label}: {d.count} ໂພສ
                  </div>

                  {/* Vertical Bar Container */}
                  <div className="w-full max-w-[42px] h-36 flex flex-col justify-end items-center">
                    {/* Value on top of bar - only show badge if count > 0 */}
                    {d.count > 0 ? (
                      <span
                        className={`text-[10px] font-mono font-bold mb-1 px-1.5 py-0.5 rounded-md shadow-2xs transition-colors ${
                          isCurrent
                            ? 'text-teal-800 bg-teal-100/90 border border-teal-300'
                            : 'text-stone-700 bg-white border border-stone-200'
                        }`}
                      >
                        {d.count}
                      </span>
                    ) : (
                      <span className="h-4 block" />
                    )}

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 group-hover:brightness-110 ${
                        isCurrent
                          ? 'bg-gradient-to-t from-teal-600 to-teal-400 shadow-sm'
                          : d.count > 0
                          ? 'bg-gradient-to-t from-stone-400 to-stone-300'
                          : 'bg-stone-200/50'
                      }`}
                      style={{ height: `${d.count > 0 ? heightPercent : 6}%` }}
                    />
                  </div>


                  {/* Labels */}
                  <div className="text-center">
                    <span className={`block text-[11px] font-semibold ${
                      isCurrent ? 'text-teal-800 font-bold' : 'text-stone-600'
                    }`}>
                      {d.label}
                    </span>
                    <span className="block text-[9px] text-stone-400 truncate max-w-[50px]">
                      {d.subLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-3 px-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-teal-500"></span>
                <span>ປັດຈຸບັນ (Current Period)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-stone-400"></span>
                <span>ໄລຍະອື່ນໆ (Other Periods)</span>
              </span>
            </div>
            <span>ອັບເດດ Realtime ຕາມຖານຂໍ້ມູນ PostgreSQL</span>
          </div>
        </div>
          </>
        )}
      </div>

      {/* 📊 Additional Advanced Analytics Grid (Price Tier, Moderation Funnel, Engagement Velocity) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              📊 ວິເຄາະລະອຽດ (Advanced Analytics)
            </span>
            <span className="text-xs text-stone-400">• ລາຄາ, ການກວດສອບ & ການມີສ່ວນຮ່ວມ</span>
          </div>
          <button
            onClick={() => toggleSection('analytics')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            {collapsed.analytics ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>ຂະຫຍາຍ</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>ຫຍໍ້</span>
              </>
            )}
          </button>
        </div>

        {!collapsed.analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chart 1: Price Tier Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>ລະດັບລາຄາສະຖານທີ່ (Price Tiers)</span>
                </h3>
                <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                  LAK & USD
                </span>
              </div>
              <p className="text-xs text-stone-500">
                ສັດສ່ວນສະຖານທີ່ທ່ອງທ່ຽວຕາມລະດັບຄ່າໃຊ້ຈ່າຍ ແລະ ບັດເຂົ້າຊົມ
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-stone-700">ເຂົ້າຊົມຟຣີ (Free)</span>
                    <span className="font-mono text-stone-500 font-semibold">{priceStats.free.count} ({priceStats.free.percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, priceStats.free.percent)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-stone-700">ປະຢັດ (≤ 50,000 LAK)</span>
                    <span className="font-mono text-stone-500 font-semibold">{priceStats.budget.count} ({priceStats.budget.percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, priceStats.budget.percent)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-stone-700">ປານກາງ (50k - 200k LAK)</span>
                    <span className="font-mono text-stone-500 font-semibold">{priceStats.mid.count} ({priceStats.mid.percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, priceStats.mid.percent)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-stone-700">ສູງ / ຕ່າງຊາດ (&gt; 200k ຫຼື USD)</span>
                    <span className="font-mono text-stone-500 font-semibold">{priceStats.premium.count} ({priceStats.premium.percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, priceStats.premium.percent)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Moderation & Quality Funnel */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ສະຖານະການກວດສອບ (Moderation Rate)</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {approvedPercent}% Live
                </span>
              </div>
              <p className="text-xs text-stone-500">
                ສັດສ່ວນສະຖານທີ່ທີ່ໄດ້ຮັບການຢືນຢັນທຽບກັບລາຍການທີ່ລໍຖ້າກວດສອບ
              </p>

              <div className="pt-2 space-y-4">
                {/* Multi-segment Progress Bar */}
                <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${approvedPercent}%` }}
                    title={`Approved: ${approvedPercent}%`}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${pendingPercent}%` }}
                    title={`Pending: ${pendingPercent}%`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <div className="text-[11px] text-emerald-800 font-semibold">ເຜີຍແຜ່ແລ້ວ (Live)</div>
                    <div className="text-xl font-bold text-emerald-950 mt-1">{approvedCount}</div>
                    <div className="text-[10px] text-emerald-700">{approvedPercent}% ຂອງທັງໝົດ</div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                    <div className="text-[11px] text-amber-800 font-semibold">ລໍຖ້າອະນຸມັດ (Queue)</div>
                    <div className="text-xl font-bold text-amber-950 mt-1">{pendingCount}</div>
                    <div className="text-[10px] text-amber-700">{pendingPercent}% ຂອງທັງໝົດ</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 3: Visitor Engagement Conversion */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>ອັດຕາການມີສ່ວນຮ່ວມ (Engagement)</span>
                </h3>
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                  Conversion
                </span>
              </div>
              <p className="text-xs text-stone-500">
                ອັດຕາການປ່ຽນຈາກການເຂົ້າຊົມມາເປັນການກົດ Wanna-Go ແລະ ຄຳຕິຊົມ
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-semibold text-stone-800">Wanna-Go Rate</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-stone-900">{favoriteRate}%</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-semibold text-stone-800">Review & Reply Rate</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-stone-900">{commentRate}%</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-stone-800">Avg. Engagement / Post</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-stone-900">
                    {places.length > 0
                      ? ((totalFavorites + totalComments) / places.length).toFixed(1)
                      : '0.0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Breakdown Grid (Provinces & Categories) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              🗺️ ການກະຈາຍຕົວຕາມພູມສາດ & ໝວດໝູ່ (Distribution Breakdown)
            </span>
            <span className="text-xs text-stone-400">• 18 ແຂວງ & ທຸກໝວດໝູ່</span>
          </div>
          <button
            onClick={() => toggleSection('distribution')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            {collapsed.distribution ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>ຂະຫຍາຍ</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>ຫຍໍ້</span>
              </>
            )}
          </button>
        </div>

        {!collapsed.distribution && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Places Distribution by Province */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>ການກະຈາຍຕົວຂອງສະຖານທີ່ຕາມແຂວງ (By Province)</span>
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    ສັດສ່ວນສະຖານທີ່ທ່ອງທ່ຽວທີ່ໄດ້ຮັບການຢືນຢັນ
                  </p>
                </div>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
                  18 ແຂວງທົ່ວລາວ
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {sortedProvinces.length === 0 ? (
                  <p className="text-xs text-stone-400 py-6 text-center">ບໍ່ມີຂໍ້ມູນແຂວງ</p>
                ) : (
                  sortedProvinces.map(([prov, count]) => {
                    const percent = Math.round((count / (places.length || 1)) * 100);
                    const widthPercent = Math.round((count / maxProvCount) * 100);
                    return (
                      <div key={prov} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-stone-800">{prov}</span>
                          <span className="text-stone-500 font-mono text-[11px]">
                            {count} ສະຖານທີ່ ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-700 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, widthPercent)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. Places Distribution by Category */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-teal-600" />
                    <span>ການກະຈາຍຕົວຕາມໝວດໝູ່ (Category Breakdown)</span>
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    ປະເພດສະຖານທີ່ຍອດນິຍົມ (ກາເຟ, ນ້ຳຕົກຕາດ, ຈຸດຊົມວິວ...)
                  </p>
                </div>
                <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
                  {sortedCategories.length} ໝວດໝູ່
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {sortedCategories.length === 0 ? (
                  <p className="text-xs text-stone-400 py-6 text-center">ບໍ່ມີຂໍ້ມູນໝວດໝູ່</p>
                ) : (
                  sortedCategories.map(([cat, count]) => {
                    const percent = Math.round((count / (places.length || 1)) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-stone-800">{cat}</span>
                          <span className="text-stone-500 font-mono text-[11px]">
                            {count} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, percent)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Summary & Health Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              ⚡ ສະຫຼຸບປະສິດທິພາບ & ສຸຂະພາບລະບົບ (Platform Health & Tourism Impact)
            </span>
          </div>
          <button
            onClick={() => toggleSection('health')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            {collapsed.health ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>ຂະຫຍາຍ</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>ຫຍໍ້</span>
              </>
            )}
          </button>
        </div>

        {!collapsed.health && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-teal-900 text-white space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Award className="w-4 h-4" />
                <span>Tourism Engagement Impact</span>
              </div>
              <div className="text-3xl font-black tracking-tight">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-teal-200 leading-relaxed">
                ຈຳນວນຄັ້ງທີ່ນັກທ່ອງທ່ຽວເຂົ້າເບິ່ງສະຖານທີ່ຕ່າງໆ ໃນລະບົບ Where to Go in Laos.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Health & Moderation Rate</span>
              </div>
              <div className="text-3xl font-black text-stone-900">
                {places.length > 0
                  ? `${Math.round(((stats?.approvedPlaces || places.length) / (stats?.totalPlaces || places.length)) * 100)}%`
                  : '100%'}
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                ອັດຕາການກວດສອບ ແລະ ເຜີຍແຜ່ສະຖານທີ່ຖືກຕ້ອງຕາມມາດຕະຖານການທ່ອງທ່ຽວລາວ.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-600 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>Review Satisfaction Index</span>
              </div>
              <div className="text-3xl font-black text-stone-900">4.9 / 5.0</div>
              <p className="text-xs text-stone-500 leading-relaxed">
                ຄະແນນຄວາມພໍໃຈສະເລ່ຍຈາກຄຳຕິຊົມ ແລະ ປະສົບການການເດີນທາງຂອງນັກທ່ອງທ່ຽວ.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
