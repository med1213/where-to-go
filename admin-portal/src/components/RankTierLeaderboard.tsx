import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { RankedPlace } from '../types';
import {
  Trophy,
  Flame,
  Award,
  Crown,
  Eye,
  Heart,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Sparkles,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export default function RankTierLeaderboard() {
  const [rankings, setRankings] = useState<RankedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState<string>('ALL');

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getRankings(50);
      setRankings(res);
    } catch (err) {
      console.error('Failed to load rankings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const tierSCount = rankings.filter((r) => r.tier === 'TIER_S').length;
  const tierACount = rankings.filter((r) => r.tier === 'TIER_A').length;
  const tierBCount = rankings.filter((r) => r.tier === 'TIER_B').length;
  const tierCCount = rankings.filter((r) => r.tier === 'TIER_C').length;

  const filtered = filterTier === 'ALL' ? rankings : rankings.filter((r) => r.tier === filterTier);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-stone-900 font-extrabold flex items-center justify-center shadow-md shadow-amber-500/20 text-sm">
          <Crown className="w-5 h-5 text-amber-950" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-stone-800 font-extrabold flex items-center justify-center shadow-sm text-sm">
          #2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white font-extrabold flex items-center justify-center shadow-sm text-sm">
          #3
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-600 font-bold flex items-center justify-center text-xs border border-stone-200">
        #{rank}
      </div>
    );
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'TIER_S':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs shadow-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            TIER S • Diamond Elite
          </span>
        );
      case 'TIER_A':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">
            <Flame className="w-3.5 h-3.5 text-teal-600" />
            TIER A • Top Trending
          </span>
        );
      case 'TIER_B':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            TIER B • Rising Popular
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
            TIER C • Standard
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-teal-950 to-stone-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/60 border border-teal-500/40 text-amber-300 text-xs font-semibold mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard & Analytics • ອັນດັບໂພສຍອດນິຍົມ</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Top Post Rank Tiers (Tier S / A / B / C)</h2>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Algorithmic scoring formula: <span className="text-amber-300 font-mono font-bold">Views × 1 + Likes × 10 + Comments × 15</span>. Automatically classifies approved destinations into engagement performance tiers.
            </p>
          </div>

          <button
            onClick={fetchRankings}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Rankings
          </button>
        </div>

        {/* Tier Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-800/80">
          <div
            onClick={() => setFilterTier(filterTier === 'TIER_S' ? 'ALL' : 'TIER_S')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              filterTier === 'TIER_S'
                ? 'bg-purple-900/60 border-purple-400'
                : 'bg-stone-800/40 border-stone-700/60 hover:bg-stone-800/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300">Tier S (Diamond)</span>
              <Crown className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-2xl font-black mt-1 text-white">{tierSCount}</div>
            <div className="text-[10px] text-stone-400">Score &ge; 250 pts</div>
          </div>

          <div
            onClick={() => setFilterTier(filterTier === 'TIER_A' ? 'ALL' : 'TIER_A')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              filterTier === 'TIER_A'
                ? 'bg-teal-900/60 border-teal-400'
                : 'bg-stone-800/40 border-stone-700/60 hover:bg-stone-800/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300">Tier A (Trending)</span>
              <Flame className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-black mt-1 text-white">{tierACount}</div>
            <div className="text-[10px] text-stone-400">Score 120 - 249 pts</div>
          </div>

          <div
            onClick={() => setFilterTier(filterTier === 'TIER_B' ? 'ALL' : 'TIER_B')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              filterTier === 'TIER_B'
                ? 'bg-amber-900/60 border-amber-400'
                : 'bg-stone-800/40 border-stone-700/60 hover:bg-stone-800/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">Tier B (Rising)</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black mt-1 text-white">{tierBCount}</div>
            <div className="text-[10px] text-stone-400">Score 50 - 119 pts</div>
          </div>

          <div
            onClick={() => setFilterTier(filterTier === 'TIER_C' ? 'ALL' : 'TIER_C')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              filterTier === 'TIER_C'
                ? 'bg-stone-700/60 border-stone-400'
                : 'bg-stone-800/40 border-stone-700/60 hover:bg-stone-800/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300">Tier C (Standard)</span>
              <Award className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl font-black mt-1 text-white">{tierCCount}</div>
            <div className="text-[10px] text-stone-400">Score &lt; 50 pts</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['ALL', 'TIER_S', 'TIER_A', 'TIER_B', 'TIER_C'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTier(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterTier === tab
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {tab === 'ALL' ? 'All Rankings' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <span className="text-xs text-stone-500 font-medium">
          Showing {filtered.length} ranked destinations
        </span>
      </div>

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs animate-pulse space-y-3">
          <div className="h-5 w-48 bg-stone-200 rounded" />
          <div className="space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-stone-50 border border-stone-100 rounded-xl flex items-center px-4 gap-4">
                <div className="w-9 h-9 rounded-xl bg-stone-200 flex-shrink-0" />
                <div className="w-12 h-12 rounded-xl bg-stone-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-44 bg-stone-200 rounded" />
                  <div className="h-3 w-28 bg-stone-100 rounded" />
                </div>
                <div className="w-28 h-6 bg-stone-200 rounded-full hidden sm:block" />
                <div className="w-28 h-4 bg-stone-200 rounded hidden md:block" />
                <div className="w-16 h-6 bg-stone-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <Trophy className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No destinations in this tier</h3>
          <p className="text-xs text-stone-500 mt-1">
            As places accumulate views, likes, and comments, they will level up through the tiers.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">Place & Category</th>
                  <th className="py-3 px-4">Creator & Top Visitor Review</th>
                  <th className="py-3 px-4">Province & District</th>
                  <th className="py-3 px-4 text-center">Rank Tier</th>
                  <th className="py-3 px-4 text-center">Engagement Metrics</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-stone-50/60 transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">{getRankBadge(item.rank)}</div>
                    </td>

                    {/* Place info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold flex-shrink-0">
                            {item.title.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-stone-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-teal-700 font-medium">
                            {item.categoryName || 'General Spot'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Creator & Top Visitor Review */}
                    <td className="py-3 px-4">
                      {item.creator && (
                        <div className="flex items-center gap-1.5 font-medium text-stone-800">
                          {item.creator.avatarUrl ? (
                            <img
                              src={item.creator.avatarUrl}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover border border-stone-200"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center">
                              {item.creator.displayName.charAt(0)}
                            </div>
                          )}
                          <span className="font-semibold text-stone-900 truncate max-w-[120px]">
                            {item.creator.displayName}
                          </span>
                        </div>
                      )}
                      {item.topReview ? (
                        <div className="mt-1 text-[11px] text-amber-950 bg-amber-50 p-1.5 rounded-lg border border-amber-200/60 max-w-xs">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700">
                            <span>⭐ {item.topReview.rating || 5}.0</span>
                            <span className="truncate max-w-[120px]">• {item.topReview.author}</span>
                          </div>
                          <p className="line-clamp-1 italic text-stone-600 mt-0.5">"{item.topReview.content}"</p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">No reviews yet</span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <span>{item.province}</span>
                      </div>
                      {item.district && (
                        <div className="text-[11px] text-stone-400 pl-5">
                          {item.district}
                        </div>
                      )}
                    </td>

                    {/* Tier */}
                    <td className="py-3 px-4 text-center">
                      {getTierBadge(item.tier)}
                    </td>

                    {/* Engagement */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-4 text-stone-600">
                        <span className="flex items-center gap-1" title="Views (x1)">
                          <Eye className="w-3.5 h-3.5 text-stone-400" />
                          <span className="font-semibold">{item.viewCount}</span>
                        </span>
                        <span className="flex items-center gap-1 text-rose-600" title="Favorites/Likes (x10)">
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          <span className="font-semibold">{item.favoriteCount}</span>
                        </span>
                        <span className="flex items-center gap-1 text-teal-600" title="Comments (x15)">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="font-semibold">{item.commentCount}</span>
                        </span>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-3 px-4 text-right">
                      <div className="text-base font-black text-stone-900 font-mono">
                        {item.score}
                      </div>
                      <div className="text-[10px] text-stone-400 uppercase font-semibold">pts</div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`http://localhost:3000/places/${item.slug || item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-teal-50 hover:text-teal-700 text-stone-600 text-xs font-semibold transition-colors"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
