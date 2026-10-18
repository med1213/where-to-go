export interface LaoProvince {
  id: string;
  nameEn: string;
  nameLo: string;
  highlight: string;
}

export const LAOS_18_PROVINCES: LaoProvince[] = [
  { id: 'vientiane-capital', nameEn: 'Vientiane Capital', nameLo: 'ນະຄອນຫຼວງວຽງຈັນ', highlight: 'Pha That Luang, Patuxay' },
  { id: 'luang-prabang', nameEn: 'Luang Prabang', nameLo: 'ຫຼວງພະບາງ', highlight: 'Kuang Si, UNESCO Old Town' },
  { id: 'vientiane-province', nameEn: 'Vientiane Province', nameLo: 'ແຂວງວຽງຈັນ', highlight: 'Vang Vieng, Nam Xay, Blue Lagoon' },
  { id: 'champasak', nameEn: 'Champasak', nameLo: 'ຈໍາປາສັກ', highlight: 'Wat Phou, Tad Fane, 4000 Islands' },
  { id: 'khammouane', nameEn: 'Khammouane', nameLo: 'ຄໍາມ່ວນ', highlight: 'Kong Lor Cave, Thakhek Loop' },
  { id: 'savannakhet', nameEn: 'Savannakhet', nameLo: 'ສະຫວັນນະເຂດ', highlight: 'That Ing Hang, Historic French Quarter' },
  { id: 'xieng-khouang', nameEn: 'Xieng Khouang', nameLo: 'ຊຽງຂວາງ', highlight: 'Plain of Jars (ທົ່ງໄຫຫີນ)' },
  { id: 'bokeo', nameEn: 'Bokeo', nameLo: 'ບໍ່ແກ້ວ', highlight: 'Gibbon Experience, Golden Triangle' },
  { id: 'luang-namtha', nameEn: 'Luang Namtha', nameLo: 'ຫຼວງນໍ້າທາ', highlight: 'Nam Ha NPA, Eco-trekking' },
  { id: 'oudomxay', nameEn: 'Oudomxay', nameLo: 'ອຸດົມໄຊ', highlight: 'Chom Ong Cave, Muang La hot springs' },
  { id: 'phongsaly', nameEn: 'Phongsaly', nameLo: 'ຜົ້ງສາລີ', highlight: '400-year-old Tea Tree plantations, High peaks' },
  { id: 'houaphanh', nameEn: 'Houaphanh', nameLo: 'ຫົວພັນ', highlight: 'Viengxay Caves, Nam Et-Phou Louey' },
  { id: 'bolikhamxay', nameEn: 'Bolikhamxay', nameLo: 'ບໍລິຄໍາໄຊ', highlight: 'Wat Phabath, Nam Kading waterfall' },
  { id: 'salavan', nameEn: 'Salavan', nameLo: 'ສາລະວັນ', highlight: 'Tad Lo Waterfall, ethnic villages' },
  { id: 'sekong', nameEn: 'Sekong', nameLo: 'ເຊກອງ', highlight: 'Tad Faek, Dakchung plateau' },
  { id: 'attapeu', nameEn: 'Attapeu', nameLo: 'ອັດຕະປື', highlight: 'Nong Fa volcanic lake, Tad Saepha' },
  { id: 'xayabury', nameEn: 'Xayabury', nameLo: 'ໄຊຍະບູລີ', highlight: 'Elephant Conservation Center' },
  { id: 'xaisomboun', nameEn: 'Xaisomboun', nameLo: 'ໄຊສົມບູນ', highlight: 'Phou Bia summit (highest in Laos)' },
];

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

export interface PlaceMedia {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  sortOrder: number;
  isCover: boolean;
}

export interface Place {
  id: string;
  userId: string;
  categoryId: number;
  title: string;
  slug: string;
  description: string;
  province: string;
  provinceId?: number | null;
  district: string | null;
  districtId?: number | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  priceRange: string | null;
  priceLao: string | null;       // ລາຄາຄົນລາວ
  priceForeigner: string | null; // ລາຄາຊາວຕ່າງຊາດ
  openingHours: Record<string, any> | null;
  contactInfo: Record<string, any> | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  viewCount: number;
  favoriteCount: number;
  commentCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category?: Category;
  media?: PlaceMedia[];
  user?: {
    id: string;
    displayName: string;
    username: string | null;
    phoneNumber: string | null;
    avatarUrl: string | null;
  };
}

export interface TrashedComment {
  id: string;
  placeId: string;
  userId: string;
  content: string;
  deletedAt: string;
  place?: { id: string; title: string };
  user?: { id: string; displayName: string };
}

export interface TrashedUser {
  id: string;
  displayName: string;
  username: string | null;
  phoneNumber: string | null;
  deletedAt: string;
}

export interface TrashData {
  places: Place[];
  comments: TrashedComment[];
  users: TrashedUser[];
  totalCount: number;
}

export interface UserItem {
  id: string;
  displayName: string;
  username: string | null;
  phoneNumber: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  avatarUrl: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  _count?: {
    places: number;
    comments: number;
    favorites: number;
  };
}

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  deletedAt: string | null;
  _count?: {
    places: number;
  };
}

export interface CommentItem {
  id: string;
  placeId: string;
  userId: string;
  content: string;
  rating: number;
  images?: string[];
  createdAt: string;
  deletedAt: string | null;
  place?: {
    id: string;
    title: string;
    slug?: string;
    province: string;
    district?: string | null;
    media?: Array<{ url: string; isCover?: boolean }>;
    user?: {
      id: string;
      displayName: string;
      username?: string | null;
      avatarUrl?: string | null;
    };
  };
  user?: {
    id: string;
    displayName: string;
    username?: string | null;
    avatarUrl: string | null;
    phoneNumber: string | null;
  };
}

export interface DistrictItem {
  id: number;
  provinceId: number;
  code: string | null;
  nameLo: string;
  nameEn: string;
  slug: string;
  createdAt?: string;
  _count?: {
    places: number;
  };
}

export interface ProvinceItem {
  id: number;
  code: string;
  nameLo: string;
  nameEn: string;
  slug: string;
  highlight: string | null;
  districts?: DistrictItem[];
  _count?: {
    districts: number;
    places: number;
  };
}

export interface UserDetail extends UserItem {
  places?: Place[];
  comments?: any[];
  favorites?: any[];
  reviewedPlaces?: any[];
}

export interface AdminStats {
  totalPlaces: number;
  pendingPlaces: number;
  approvedPlaces: number;
  totalUsers: number;
  totalComments: number;
  totalFavorites: number;
  trashedPlaces: number;
  totalProvinces?: number;
  totalDistricts?: number;
}

export interface RankedPlace {
  rank: number;
  id: string;
  title: string;
  slug: string;
  province: string;
  district: string;
  categoryName: string;
  coverImage: string | null;
  creator?: {
    id?: string;
    displayName: string;
    username?: string | null;
    avatarUrl?: string | null;
  };
  topReview?: {
    content: string;
    rating?: number;
    author: string;
  } | null;
  viewCount: number;
  favoriteCount: number;
  commentCount: number;
  score: number;
  tier: 'TIER_S' | 'TIER_A' | 'TIER_B' | 'TIER_C';
  tierLabel: string;
  tierColor: string;
}

export interface BannerItem {
  id: string;
  titleLo: string;
  titleEn: string | null;
  subtitleLo: string | null;
  subtitleEn: string | null;
  imageUrl: string;
  linkUrl: string | null;
  placeId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminTab = 'dashboard' | 'reviews' | 'places' | 'rankings' | 'banners' | 'provinces' | 'users' | 'categories' | 'comments' | 'trash';
