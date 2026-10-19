import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  LogOut,
  RefreshCw,
  Download,
  Key,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import { adminApi } from '../services/api';
import { RevokedTokenRecord, ActiveSessionUser } from '../types';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { exportToCsv } from '../utils/export';

export default function SecurityPage() {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [activeSessions, setActiveSessions] = useState<ActiveSessionUser[]>([]);
  const [revokedTokens, setRevokedTokens] = useState<RevokedTokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [forceLoggingOut, setForceLoggingOut] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'blacklist'>('sessions');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessions, tokens] = await Promise.all([
        adminApi.getActiveSessions(),
        adminApi.getRevokedTokens(100),
      ]);
      setActiveSessions(sessions);
      setRevokedTokens(tokens);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch security data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleForceLogout = async (user: ActiveSessionUser) => {
    const confirmMsg = t(
      `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການບັງຄັບໃຫ້ຜູ້ໃຊ້ "${user.username || user.displayName}" ອອກຈາກລະບົບ?`,
      `Are you sure you want to force logout user "${user.username || user.displayName}"?`
    );
    if (!window.confirm(confirmMsg)) return;

    setForceLoggingOut(user.id);
    try {
      const res = await adminApi.forceLogoutUser(user.id);
      showToast(res.message || 'User session revoked successfully', 'success');
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to force logout user', 'error');
    } finally {
      setForceLoggingOut(null);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    showToast(t('ຄັດລອກ Token Hash ສຳເລັດ!', 'Token Hash copied to clipboard!'), 'success');
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const handleExportRevokedCsv = () => {
    const rows = revokedTokens.map((item) => ({
      ID: item.id,
      Username: item.username || 'N/A',
      UserID: item.userId || 'N/A',
      Reason: item.reason || 'USER_LOGOUT',
      RevokedAt: new Date(item.createdAt).toLocaleString(),
      ExpiresAt: new Date(item.expiresAt).toLocaleString(),
      TokenHashSHA256: item.tokenHash,
    }));
    exportToCsv(`wheretogo_blacklist_audit_${new Date().toISOString().slice(0, 10)}`, rows);
    showToast(t('ດາວໂຫຼດ CSV ສຳເລັດແລ້ວ', 'Exported Blacklist CSV successfully'), 'success');
  };

  const handleExportSessionsCsv = () => {
    const rows = activeSessions.map((u) => ({
      ID: u.id,
      Username: u.username || 'N/A',
      DisplayName: u.displayName,
      Phone: u.phoneNumber || 'N/A',
      Role: u.role,
      LastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'N/A',
      CreatedAt: new Date(u.createdAt).toLocaleString(),
    }));
    exportToCsv(`wheretogo_active_sessions_${new Date().toISOString().slice(0, 10)}`, rows);
    showToast(t('ດາວໂຫຼດ CSV ສຳເລັດແລ້ວ', 'Exported Active Sessions CSV successfully'), 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {t('ສູນຄວາມປອດໄພ & Session', 'Security & Session Center')}
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PS512 RSA-4096
              </span>
            </h1>
            <p className="text-stone-400 text-sm mt-1">
              {t(
                'ຕິດຕາມກວດກາ Session ທີ່ກຳລັງເຮັດວຽກ, ບັນຊີລາຍຊື່ Blacklist ແລະ ຄວາມປອດໄພຂອງລະບົບ',
                'Monitor live sessions, blacklisted JWT tokens, and system authentication security'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-stone-200 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('ໂຫຼດຂໍ້ມູນໃໝ່', 'Refresh')}
          </button>

          <button
            onClick={activeTab === 'sessions' ? handleExportSessionsCsv : handleExportRevokedCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-950/40"
          >
            <Download className="w-4 h-4" />
            {t('ດາວໂຫຼດ CSV', 'Export CSV')}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-400">
              {t('Sessions ທີ່ກຳລັງເຊື່ອມຕໍ່', 'Active Sessions')}
            </span>
            <div className="text-2xl font-bold text-white mt-1">{activeSessions.length}</div>
            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('ເຂົ້າສູ່ລະບົບແລ້ວ', 'Currently authenticated')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-400">
              {t('Tokens ຖືກ Blacklist', 'Revoked Tokens')}
            </span>
            <div className="text-2xl font-bold text-rose-400 mt-1">{revokedTokens.length}</div>
            <span className="text-xs text-rose-400/80 flex items-center gap-1 mt-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {t('ຖືກຍົກເລີກໃນ DB', 'Blacklisted in database')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-400">
              {t('ລະບົບເຂົ້າລະຫັດ', 'Algorithm')}
            </span>
            <div className="text-lg font-bold text-emerald-400 mt-1">PS512 + Argon2id</div>
            <span className="text-xs text-stone-400 mt-1">RSA-4096 / High Security</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Key className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-400">
              {t('ການລຶບ Token ໝົດອາຍຸ', 'Cleanup Daemon')}
            </span>
            <div className="text-lg font-bold text-white mt-1">Every 15 min</div>
            <span className="text-xs text-stone-400 mt-1">Auto-purge expired tokens</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-800">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'sessions'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          {t('Session ທີ່ກຳລັງເຮັດວຽກ', 'Active Logged-in Sessions')} ({activeSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('blacklist')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'blacklist'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          {t('ບັນຊີ Blacklist Token', 'Revoked Token Blacklist')} ({revokedTokens.length})
        </button>
      </div>

      {/* Tab 1: Active Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/50">
            <div>
              <h2 className="text-base font-semibold text-white">
                {t('ຜູ້ໃຊ້ທີ່ກຳລັງເຂົ້າສູ່ລະບົບ', 'Current Authenticated Users')}
              </h2>
              <p className="text-xs text-stone-400">
                {t(
                  'ຜູ້ເບິ່ງແຍງລະບົບສາມາດບັງຄັບໃຫ້ User ອອກຈາກລະບົບ (Force Logout) ໄດ້ທັນທີ',
                  'Admins can forcefully revoke any active user session instantly'
                )}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-950/60 text-stone-400 border-b border-stone-800 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">{t('ຜູ້ໃຊ້', 'User')}</th>
                  <th className="py-3 px-4">{t('ສິດທິ', 'Role')}</th>
                  <th className="py-3 px-4">{t('ເບີໂທລະສັບ', 'Phone')}</th>
                  <th className="py-3 px-4">{t('ເຂົ້າສູ່ລະບົບລ່າສຸດ', 'Last Login')}</th>
                  <th className="py-3 px-4 text-right">{t('ຈັດການ', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {activeSessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500">
                      {t('ບໍ່ມີ Session ທີ່ເຮັດວຽກໃນຕອນນີ້', 'No active sessions currently found')}
                    </td>
                  </tr>
                ) : (
                  activeSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
                            {session.avatarUrl ? (
                              <img
                                src={session.avatarUrl}
                                alt=""
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              (session.displayName || session.username || 'U')[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {session.displayName || 'No Name'}
                            </div>
                            <div className="text-xs text-stone-400">
                              @{session.username || 'no-username'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                            session.role === 'ADMIN'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : session.role === 'MODERATOR'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-stone-700/30 text-stone-400 border border-stone-700/50'
                          }`}
                        >
                          {session.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-stone-400">
                        {session.phoneNumber || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-stone-400">
                        {session.lastLoginAt
                          ? new Date(session.lastLoginAt).toLocaleString()
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleForceLogout(session)}
                          disabled={forceLoggingOut === session.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          {forceLoggingOut === session.id
                            ? t('ກຳລັງຕັດ...', 'Revoking...')
                            : t('ບັງຄັບອອກ (Force Logout)', 'Force Logout')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Revoked Tokens */}
      {activeTab === 'blacklist' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/50">
            <div>
              <h2 className="text-base font-semibold text-white">
                {t('ບັນຊີລາຍຊື່ Token ທີ່ຖືກ Blacklist', 'Revoked & Blacklisted JWT Ledger')}
              </h2>
              <p className="text-xs text-stone-400">
                {t(
                  'Tokens ເຫຼົ່ານີ້ຖືກຕັດສິດ ແລະ ບໍ່ສາມາດນຳໃຊ້ເຂົ້າເຖິງລະບົບໄດ້ອີກ',
                  'Blacklisted tokens stored in PostgreSQL and in-memory Set (Fast O(1) rejection)'
                )}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-950/60 text-stone-400 border-b border-stone-800 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">{t('ຜູ້ໃຊ້', 'User')}</th>
                  <th className="py-3 px-4">{t('ເຫດຜົນ', 'Reason')}</th>
                  <th className="py-3 px-4">{t('Token Hash (SHA-256)', 'Token Hash')}</th>
                  <th className="py-3 px-4">{t('ວັນທີຍົກເລີກ', 'Revoked At')}</th>
                  <th className="py-3 px-4">{t('ວັນໝົດອາຍຸ', 'Expires At')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {revokedTokens.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500">
                      {t('ຍັງບໍ່ມີ Token ທີ່ຖືກ Blacklist', 'No revoked tokens recorded')}
                    </td>
                  </tr>
                ) : (
                  revokedTokens.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {item.username || item.userId || 'Unknown'}
                        </div>
                        {item.userId && (
                          <div className="text-[11px] font-mono text-stone-500 truncate max-w-[150px]">
                            {item.userId}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {item.reason || 'USER_LOGOUT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-stone-400 bg-stone-950 px-2 py-1 rounded border border-stone-800 max-w-[180px] truncate">
                            {item.tokenHash}
                          </code>
                          <button
                            onClick={() => handleCopyHash(item.tokenHash)}
                            title="Copy SHA-256 Hash"
                            className="p-1 text-stone-400 hover:text-stone-200 transition-colors"
                          >
                            {copiedHash === item.tokenHash ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-stone-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-stone-400">
                        {new Date(item.expiresAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
