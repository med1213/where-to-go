import React, { useState, useEffect } from 'react';
import { UserItem, UserDetail } from '../types';
import { adminApi } from '../services/api';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  Trash2,
  RefreshCw,
  Phone,
  Calendar,
  Clock,
  Compass,
  MessageSquare,
  Heart,
  Plus,
  Edit2,
  X,
  Check,
  Eye,
  Lock,
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'USER' | 'MODERATOR' | 'ADMIN'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // User Create / Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [userFormData, setUserFormData] = useState({
    displayName: '',
    username: '',
    phoneNumber: '',
    role: 'USER',
    password: '',
  });

  // User Relationship Details Modal
  const [inspectingUser, setInspectingUser] = useState<UserDetail | null>(null);
  const [isInspectLoading, setIsInspectLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await adminApi.getUsers(searchQuery);
      setUsers(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຜູ້ໃຊ້ໄດ້');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const openCreateModal = () => {
    setEditingUser(null);
    setUserFormData({
      displayName: '',
      username: '',
      phoneNumber: '',
      role: 'USER',
      password: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setUserFormData({
      displayName: u.displayName,
      username: u.username || '',
      phoneNumber: u.phoneNumber || '',
      role: u.role,
      password: '',
    });
    setIsFormModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.displayName || !userFormData.phoneNumber) {
      setErrorMsg('ກະລຸນາປ້ອນຊື່ ແລະ ເບີໂທລະສັບ');
      return;
    }

    if (!editingUser && !userFormData.password) {
      setErrorMsg('ກະລຸນາປ້ອນລະຫັດຜ່ານຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (editingUser) {
        const updatePayload: any = {
          displayName: userFormData.displayName,
          phoneNumber: userFormData.phoneNumber,
          username: userFormData.username || undefined,
          role: userFormData.role,
        };
        if (userFormData.password) {
          updatePayload.password = userFormData.password;
        }
        await adminApi.updateUser(editingUser.id, updatePayload);
        setSuccessMsg(`ແກ້ໄຂບັນຊີ "${userFormData.displayName}" ສໍາເລັດແລ້ວ`);
      } else {
        await adminApi.createUser({
          displayName: userFormData.displayName,
          username: userFormData.username || `user_${Date.now()}`,
          phoneNumber: userFormData.phoneNumber,
          role: userFormData.role,
          password: userFormData.password,
        });
        setSuccessMsg(`ເພີ່ມຜູ້ໃຊ້ໃໝ່ "${userFormData.displayName}" ສໍາເລັດແລ້ວ`);
      }
      setIsFormModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຜູ້ໃຊ້');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await adminApi.updateUserRole(userId, newRole);
      setSuccessMsg(`ປ່ຽນສິດທິຜູ້ໃຊ້ເປັນ ${newRole} ສໍາເລັດແລ້ວ`);
      await fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສິດ');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSoftDelete = async (user: UserItem) => {
    if (!window.confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ (Soft Delete / Ban) ບັນຊີ "${user.displayName}"?`)) {
      return;
    }

    setUpdatingId(user.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await adminApi.softDeleteUser(user.id);
      setSuccessMsg(`ລຶບບັນຊີ ${user.displayName} ສໍາເລັດແລ້ວ (ສາມາດກູ້ຄືນໄດ້ທີ່ຖັງຂີ້ເຫຍື້ອ)`);
      await fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການລຶບ');
    } finally {
      setUpdatingId(null);
    }
  };

  const inspectUserRelations = async (userId: string) => {
    setIsInspectLoading(true);
    try {
      const detail = await adminApi.getUserDetail(userId);
      setInspectingUser(detail);
    } catch (err: any) {
      setErrorMsg(err.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຄວາມສຳພັນໄດ້');
    } finally {
      setIsInspectLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (selectedRole !== 'ALL' && u.role !== selectedRole) return false;
    return true;
  });

  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
  const totalModerators = users.filter((u) => u.role === 'MODERATOR').length;
  const totalRegular = users.filter((u) => u.role === 'USER').length;

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            <span>ຈັດການບັນຊີຜູ້ໃຊ້ & ສິດທິ (User & Role CRUD)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            ເພີ່ມ, ແກ້ໄຂ, ປ່ຽນລະດັບສິດທິ (ADMIN, MODERATOR, USER), ແລະ ກວດສອບຄວາມສຳພັນ (Relationship Tree)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            <span>ໂຫຼດໃໝ່</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-900/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>ເພີ່ມຜູ້ໃຊ້ໃໝ່ (Create User)</span>
          </button>
        </div>
      </div>

      {/* Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-stone-400">ຜູ້ໃຊ້ທັງໝົດ</p>
            <p className="text-lg font-bold text-stone-900">{users.length}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-purple-500">ຜູ້ດູແລລະບົບ (Admin)</p>
            <p className="text-lg font-bold text-purple-700">{totalAdmins}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-blue-500">ຜູ້ກວດສອບ (Moderator)</p>
            <p className="text-lg font-bold text-blue-700">{totalModerators}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-teal-500">ນັກທ່ອງທ່ຽວ (Traveler)</p>
            <p className="text-lg font-bold text-teal-700">{totalRegular}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          {successMsg}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="ຄົ້ນຫາຊື່, ຊື່ຜູ້ໃຊ້, ເບີໂທ (+856...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-lao"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'ADMIN', 'MODERATOR', 'USER'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedRole === role
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {role === 'ALL' && 'ທຸກຄົນ'}
              {role === 'ADMIN' && 'Admin'}
              {role === 'MODERATOR' && 'Moderator'}
              {role === 'USER' && 'Traveler'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">ຜູ້ໃຊ້ (User Profile)</th>
                <th className="py-3.5 px-4">ເບີໂທລະສັບ (Phone)</th>
                <th className="py-3.5 px-4">ບົດບາດສິດທິ (Role)</th>
                <th className="py-3.5 px-4">ຄວາມສຳພັນ (Relationships)</th>
                <th className="py-3.5 px-4">ວັນທີສະໝັກ (Registered)</th>
                <th className="py-3.5 px-4 text-right">ຈັດການ (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ຕາມເງື່ອນໄຂ
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isBusy = updatingId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                      {/* Profile info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-stone-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                              {u.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-stone-900">{u.displayName}</p>
                            <p className="text-[11px] text-stone-400">
                              @{u.username || 'phone_user'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        {u.phoneNumber ? (
                          <span className="flex items-center gap-1.5 font-mono text-stone-700 text-xs">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            {u.phoneNumber}
                          </span>
                        ) : (
                          <span className="text-stone-300">-</span>
                        )}
                      </td>

                      {/* Role Selector */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            disabled={isBusy}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : u.role === 'MODERATOR'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                          >
                            <option value="USER">USER (ສະມາຊິກ)</option>
                            <option value="MODERATOR">MODERATOR (ຜູ້ກວດ)</option>
                            <option value="ADMIN">ADMIN (ຜູ້ດູແລ)</option>
                          </select>
                        </div>
                      </td>

                      {/* Relationship Activity count with View Button */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => inspectUserRelations(u.id)}
                          className="flex items-center gap-3 text-stone-600 text-[11px] hover:text-teal-700 p-1 rounded-lg hover:bg-teal-50 transition-colors"
                          title="Click to inspect relationship tree"
                        >
                          <span title="ສະຖານທີ່ທີ່ໂພສ" className="flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-teal-600" />
                            {u._count?.places || 0}
                          </span>
                          <span title="ຄອມເມັ້ນ" className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                            {u._count?.comments || 0}
                          </span>
                          <span title="ບັນທຶກຖືກໃຈ" className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                            {u._count?.favorites || 0}
                          </span>
                          <Eye className="w-3 h-3 text-stone-400" />
                        </button>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-stone-500">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>{new Date(u.createdAt).toLocaleDateString('lo-LA')}</span>
                        </div>
                        {u.lastLoginAt && (
                          <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>ເຂົ້າ: {new Date(u.lastLoginAt).toLocaleDateString('lo-LA')}</span>
                          </div>
                        )}
                      </td>

                      {/* Actions: Edit, Soft delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(u)}
                            disabled={isBusy}
                            title="Edit User Profile"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSoftDelete(u)}
                            disabled={isBusy}
                            title="Soft delete (ຍ້າຍໄປຖັງຂີ້ເຫຍື້ອ)"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Create / Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">
                {editingUser ? 'ແກ້ໄຂບັນຊີຜູ້ໃຊ້ (Edit User)' : 'ເພີ່ມຜູ້ໃຊ້ໃໝ່ (Create User)'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ຊື່ຜູ້ໃຊ້ງານ (Display Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ເຊັ່ນ: ສົມໄຊ ວົງສາ (Somxay Vongsa)"
                  value={userFormData.displayName}
                  onChange={(e) => setUserFormData({ ...userFormData, displayName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-lao focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="somxay"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ເບີໂທລະສັບ (Phone) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="02055551234"
                    value={userFormData.phoneNumber}
                    onChange={(e) => setUserFormData({ ...userFormData, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ລະດັບສິດທິ (Role Level) *
                </label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  <option value="USER">USER - ນັກທ່ອງທ່ຽວທົ່ວໄປ (General Traveler)</option>
                  <option value="MODERATOR">MODERATOR - ຜູ້ກວດສອບສະຖານທີ່ (Reviewer)</option>
                  <option value="ADMIN">ADMIN - ຜູ້ດູແລລະບົບສູງສຸດ (Super Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {editingUser ? 'ປ່ຽນລະຫັດຜ່ານ (ປະວ່າງໄວ້ຖ້າບໍ່ຕ້ອງການປ່ຽນ)' : 'ລະຫັດຜ່ານ (Password) *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    placeholder="ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-900/10"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUser ? 'ບັນທຶກ' : 'ສ້າງບັນຊີ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Relationship Tree Inspection Modal */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
                  {inspectingUser.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm font-lao">
                    {inspectingUser.displayName} ({inspectingUser.role})
                  </h3>
                  <p className="text-[11px] text-stone-400 font-mono">
                    ID: {inspectingUser.id} • @{inspectingUser.username || 'phone_user'} • {inspectingUser.phoneNumber}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingUser(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Tabs of related records */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Places Relation */}
              <div>
                <h4 className="font-bold text-stone-800 text-xs flex items-center gap-2 mb-2">
                  <Compass className="w-4 h-4 text-teal-600" />
                  <span>ສະຖານທີ່ທີ່ໂພສ ({inspectingUser.places?.length || 0} ແຫ່ງ)</span>
                </h4>
                {inspectingUser.places && inspectingUser.places.length > 0 ? (
                  <div className="space-y-2">
                    {inspectingUser.places.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-stone-900">{p.title}</p>
                          <p className="text-[10px] text-stone-400">
                            {p.province} • {p.category?.name || 'Category'}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 italic">ຍັງບໍ່ມີສະຖານທີ່ທີ່ໂພສ</p>
                )}
              </div>

              {/* Comments Relation */}
              <div>
                <h4 className="font-bold text-stone-800 text-xs flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <span>ຄອມເມັ້ນ & ຣີວິວ ({inspectingUser.comments?.length || 0} ຂໍ້ຄວາມ)</span>
                </h4>
                {inspectingUser.comments && inspectingUser.comments.length > 0 ? (
                  <div className="space-y-2">
                    {inspectingUser.comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-teal-700">
                            {c.place?.title || 'Attraction'}
                          </span>
                          <span className="text-stone-400 text-[10px]">
                            {new Date(c.createdAt).toLocaleDateString('lo-LA')}
                          </span>
                        </div>
                        <p className="text-stone-700">{c.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 italic">ຍັງບໍ່ມີຄອມເມັ້ນ</p>
                )}
              </div>

              {/* Favorites Relation */}
              <div>
                <h4 className="font-bold text-stone-800 text-xs flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>ສະຖານທີ່ທີ່ຖືກໃຈ / Wanna Go ({inspectingUser.favorites?.length || 0} ແຫ່ງ)</span>
                </h4>
                {inspectingUser.favorites && inspectingUser.favorites.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {inspectingUser.favorites.map((f) => (
                      <div
                        key={f.id}
                        className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-[11px]"
                      >
                        <p className="font-bold text-stone-900">{f.place?.title}</p>
                        <p className="text-[10px] text-stone-500">{f.place?.province}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 italic">ຍັງບໍ່ມີລາຍການຖືກໃຈ</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
              <button
                onClick={() => setInspectingUser(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-white text-xs font-semibold"
              >
                ປິດ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
