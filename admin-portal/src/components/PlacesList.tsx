import React, { useState } from 'react';
import { Place, LAOS_18_PROVINCES } from '../types';
import { adminApi } from '../services/api';
import AdminCreatePlaceModal from './AdminCreatePlaceModal';
import AdminEditPlaceModal from './AdminEditPlaceModal';
import { useToast } from '../context/ToastContext';
import {
  MapPin,
  Heart,
  Eye,
  MessageSquare,
  Trash2,
  Filter,
  Search,
  CheckCircle,
  ExternalLink,
  PlusCircle,
  Edit2,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';

interface PlacesListProps {
  places: Place[];
  onRefresh: () => void;
  selectedProvince: string;
  onSelectProvince: (prov: string) => void;
}

export default function PlacesList({
  places,
  onRefresh,
  selectedProvince,
  onSelectProvince,
}: PlacesListProps) {
  const { success, error: toastError, info } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  const handleSoftDelete = async (placeId: string, title: string) => {
    if (!confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍ້າຍ "${title}" ໄປທີ່ຖັງຂີ້ເຫຍື້ອ? (Move to Trash Bin)?`)) {
      return;
    }

    setDeletingId(placeId);
    try {
      await adminApi.softDeletePlace(placeId);
      success(`ຍ້າຍ "${title}" ໄປທີ່ຖັງຂີ້ເຫຍື້ອແລ້ວ!`);
      onRefresh();
    } catch (err: any) {
      toastError(`Error soft-deleting place: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPlaces = places.filter((p) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.slug && p.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.province.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvince =
      selectedProvince === 'ALL' ||
      p.province.toLowerCase().includes(selectedProvince.toLowerCase());

    return matchesSearch && matchesProvince;
  });

  return (
    <div className="space-y-6">
      {/* Title & 18 Provinces Filter Controls */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-lao">
              ລາຍການສະຖານທີ່ທ່ອງທ່ຽວທັງໝົດ (All Places Table View)
            </h2>
            <p className="text-xs text-stone-500 font-lao">
              ຕາຕະລາງລາຍການສະຖານທີ່, ລາຄາຄົນລາວ-ຕ່າງຊາດ, ພ້ອມປຸ່ມແກ້ໄຂຂໍ້ມູນ (Edit Post)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200/60 font-lao">
              ພົບ {filteredPlaces.length} ສະຖານທີ່
            </span>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors font-lao"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>+ ໂພສສະຖານທີ່ (Admin Post)</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ຄົ້ນຫາຊື່ສະຖານທີ່, slug, ຕາດ, ຮ້ານກາເຟ..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white font-lao"
            />
          </div>

          {/* 18 Provinces Selector */}
          <div className="md:col-span-2 flex items-center gap-2">
            <Filter className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <select
              value={selectedProvince}
              onChange={(e) => onSelectProvince(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white font-lao cursor-pointer"
            >
              <option value="ALL">📍 ທຸກແຂວງ (All 18 Provinces of Laos)</option>
              {LAOS_18_PROVINCES.map((prov) => (
                <option key={prov.id} value={prov.nameEn}>
                  {prov.nameLo} • {prov.nameEn} ({prov.highlight})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Places Table View */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 text-stone-700 font-bold border-b border-stone-200 select-none">
              <tr>
                <th className="py-3.5 px-4 w-16">ຮູບ (Photo)</th>
                <th className="py-3.5 px-4 min-w-[220px]">ສະຖານທີ່ (Title & Info)</th>
                <th className="py-3.5 px-4 min-w-[150px]">ແຂວງ/ເມືອງ (Location)</th>
                <th className="py-3.5 px-4 min-w-[130px]">ໝວດໝູ່ (Category)</th>
                <th className="py-3.5 px-4 min-w-[170px]">ລາຄາ (Pricing 🇱🇦 & 🌐)</th>
                <th className="py-3.5 px-4 min-w-[140px]">ຜູ້ໂພສ (Creator)</th>
                <th className="py-3.5 px-4 min-w-[120px]">ຍອດນິຍົມ (Engagement)</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">ຈັດການ (Actions)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {filteredPlaces.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400 font-lao">
                    <p className="text-sm font-semibold">ບໍ່ພົບສະຖານທີ່ທີ່ກົງກັບການຄົ້ນຫາ</p>
                    <p className="text-xs text-stone-400 mt-1">ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ເລືອກແຂວງອື່ນ</p>
                  </td>
                </tr>
              ) : (
                filteredPlaces.map((place) => {
                  const mediaCount = place.media ? place.media.length : 0;
                  const coverImage =
                    place.media && place.media.length > 0
                      ? place.media.find((m) => m.isCover)?.url || place.media[0].url
                      : 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800';

                  const publicUrl = `http://localhost:3000/post/${place.slug || place.id}`;

                  return (
                    <tr
                      key={place.id}
                      className="hover:bg-teal-50/30 transition-colors group"
                    >
                      {/* Thumbnail & Multi-image badge */}
                      <td className="py-3 px-4">
                        <div className="relative w-14 h-11 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                          <img
                            src={coverImage}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {mediaCount > 1 && (
                            <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/70 backdrop-blur-xs text-[9px] text-white font-mono rounded">
                              {mediaCount}📷
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Title & Slug */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 group-hover:text-teal-700 transition-colors font-lao text-sm line-clamp-1">
                          {place.title}
                        </div>
                        {place.slug && (
                          <div className="text-[10px] text-stone-400 font-mono truncate max-w-[200px]">
                            /{place.slug}
                          </div>
                        )}
                        {place.description && (
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 font-lao max-w-[280px]">
                            {place.description.length > 60
                              ? `${place.description.substring(0, 60).trim()}...`
                              : place.description}
                          </p>
                        )}
                      </td>

                      {/* Province & District */}
                      <td className="py-3 px-4 font-lao">
                        <div className="flex items-center gap-1 font-semibold text-stone-800">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                          <span className="truncate max-w-[140px]">{place.province}</span>
                        </div>
                        {place.district && (
                          <div className="text-[11px] text-stone-500 pl-4.5 truncate max-w-[140px]">
                            {place.district}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-semibold text-[11px] border border-stone-200">
                          {place.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Dual Pricing */}
                      <td className="py-3 px-4 text-[11px] space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-teal-800 font-medium">🇱🇦</span>
                          <span className="font-semibold text-stone-800 truncate max-w-[140px]">
                            {place.priceLao || 'ຟຣີ / ບໍ່ລະບຸ'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-amber-700 font-medium">🌐</span>
                          <span className="font-semibold text-amber-800 truncate max-w-[140px]">
                            {place.priceForeigner || place.priceRange || 'ມາດຕະຖານ'}
                          </span>
                        </div>
                      </td>

                      {/* Creator */}
                      <td className="py-3 px-4">
                        {place.user ? (
                          <div className="flex items-center gap-1.5">
                            {place.user.avatarUrl ? (
                              <img
                                src={place.user.avatarUrl}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover border border-teal-500/30 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                {place.user.displayName.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-stone-800 text-[11px] truncate max-w-[110px] font-lao">
                                {place.user.displayName}
                              </div>
                              <div className="text-[10px] text-stone-400 truncate max-w-[110px]">
                                @{place.user.username}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-[11px] italic">System</span>
                        )}
                      </td>

                      {/* Engagement */}
                      <td className="py-3 px-4 text-stone-500">
                        <div className="flex items-center gap-2.5 text-[11px]">
                          <span className="flex items-center gap-0.5 text-rose-600 font-semibold" title="Wanna Go Likes">
                            <Heart className="w-3.5 h-3.5 fill-rose-500" />
                            {place.favoriteCount || 0}
                          </span>
                          <span className="flex items-center gap-0.5 text-stone-600" title="Visitor Comments">
                            <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                            {place.commentCount || 0}
                          </span>
                          <span className="flex items-center gap-0.5 text-stone-400" title="Views">
                            <Eye className="w-3.5 h-3.5 text-stone-400" />
                            {place.viewCount || 0}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          {/* Edit button */}
                          <button
                            onClick={() => setEditingPlace(place)}
                            title="ແກ້ໄຂສະຖານທີ່ (Edit Place)"
                            className="p-1.5 rounded-lg text-teal-700 hover:text-teal-900 hover:bg-teal-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Public View link */}
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="ເບິ່ງໜ້າເວັບສາທາລະນະ (View on Public Web)"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Move to trash */}
                          <button
                            onClick={() => handleSoftDelete(place.id, place.title)}
                            disabled={deletingId === place.id}
                            title="ຍ້າຍໄປຖັງຂີ້ເຫຍື້ອ (Move to Trash)"
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

      {/* Admin Post Place Modal */}
      <AdminCreatePlaceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Admin Edit Place Modal */}
      <AdminEditPlaceModal
        isOpen={!!editingPlace}
        onClose={() => setEditingPlace(null)}
        place={editingPlace}
        onSuccess={onRefresh}
      />
    </div>
  );
}
