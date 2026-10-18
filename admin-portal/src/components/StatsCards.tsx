import React from 'react';
import { AdminStats } from '../types';
import { CheckSquare, MapPin, Users, Trash2 } from 'lucide-react';

export default function StatsCards({ stats }: { stats: AdminStats | null }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Pending Approvals */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-stone-500 font-lao">ລໍຖ້າອະນຸມັດ (Pending Review)</p>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pendingPlaces}</h3>
          <p className="text-[11px] text-stone-400 mt-0.5 font-lao">ສະຖານທີ່ໃໝ່ທີ່ລໍຖ້າກວດສອບ</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <CheckSquare className="w-6 h-6" />
        </div>
      </div>

      {/* Approved Places */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-stone-500 font-lao">ເຜີຍແຜ່ແລ້ວ (Approved Places)</p>
          <h3 className="text-2xl font-extrabold text-teal-700 mt-1">{stats.approvedPlaces}</h3>
          <p className="text-[11px] text-stone-400 mt-0.5 font-lao">ສະແດງໃນໜ້າເວັບໃຫ້ທຸກຄົນເຫັນ</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <MapPin className="w-6 h-6" />
        </div>
      </div>

      {/* Total Travelers */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-stone-500 font-lao">ສະມາຊິກຜູ້ໃຊ້ (Travelers)</p>
          <h3 className="text-2xl font-extrabold text-stone-800 mt-1">{stats.totalUsers}</h3>
          <p className="text-[11px] text-stone-400 mt-0.5 font-lao">ລົງທະບຽນດ້ວຍເບີໂທ ຫຼື ຊື່ຜູ້ໃຊ້</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Trash Bin Items */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-stone-500 font-lao">ຖັງຂີ້ເຫຍື້ອ (Trash Bin)</p>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{stats.trashedPlaces}</h3>
          <p className="text-[11px] text-stone-400 mt-0.5 font-lao">Soft-deleted ສາມາດກູ້ຄືນໄດ້</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <Trash2 className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
