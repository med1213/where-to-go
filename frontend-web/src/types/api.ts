export type Role = 'USER' | 'MODERATOR' | 'ADMIN';

export type PlaceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type FavoriteType = 'WANNA_GO' | 'FAVORITE' | 'VISITED';

export interface User {
  id: string;
  username: string | null;
  phoneNumber: string | null;
  displayName: string;
  avatarUrl: string | null;
  role: Role;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterDto {
  username?: string;
  phoneNumber?: string;
  displayName: string;
  password: string;
  avatarUrl?: string;
}

export interface LoginDto {
  identifier: string; // username or phone number
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface District {
  id: number;
  provinceId: number;
  code: string | null;
  nameLo: string;
  nameEn: string;
  slug: string;
  _count?: {
    places: number;
  };
}

export interface Province {
  id: number;
  code: string;
  nameLo: string;
  nameEn: string;
  slug: string;
  highlight: string | null;
  districts?: District[];
  _count?: {
    districts: number;
    places: number;
  };
}

export interface Category {
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

export interface PlaceMedia {
  id: string;
  placeId: string;
  url: string;
  thumbnailUrl: string | null;
  mediaType: string;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
}

export interface PlaceComment {
  id: string;
  placeId: string;
  userId: string;
  parentId?: string | null;
  content: string;
  rating: number | null;
  images?: string[];
  replies?: PlaceComment[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export type Comment = PlaceComment;

export interface Place {
  id: string;
  userId: string;
  categoryId: number;
  provinceId?: number | null;
  districtId?: number | null;
  title: string;
  slug: string;
  description: string;
  province: string;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  priceRange: string | null;
  priceLao: string | null;       // ລາຄາຄົນລາວ (LAK)
  priceForeigner: string | null; // ລາຄາຊາວຕ່າງຊາດ (USD / LAK)
  openingHours: Record<string, any> | null;
  contactInfo: Record<string, any> | null;
  status: PlaceStatus;
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
  provinceRel?: Province;
  districtRel?: District;
  media?: PlaceMedia[];
  user?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  comments?: Comment[];
  _count?: {
    comments: number;
    favorites: number;
  };
}

export interface CreatePlaceDto {
  title: string;
  description: string;
  categoryId: number;
  province: string;
  provinceId?: number;
  district?: string;
  districtId?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  priceLao?: string;
  priceForeigner?: string;
  openingHours?: Record<string, any>;
  contactInfo?: Record<string, any>;
  mediaUrls?: string[];
}

export interface UpdatePlaceDto extends Partial<CreatePlaceDto> {}

export interface QueryPlacesDto {
  q?: string;
  search?: string;
  province?: string;
  provinceId?: number;
  districtId?: number;
  category?: string;
  categoryId?: number;
  sort?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export interface UploadResponse {
  url: string;
  thumbnailUrl: string;
  filename: string;
  originalName: string;
  size: number;
  format: string;
}

export interface CreateCommentDto {
  content: string;
  rating?: number;
  images?: string[];
  parentId?: string;
}

export interface ToggleFavoriteDto {
  listType?: FavoriteType;
  personalNote?: string;
}

export interface ToggleFavoriteResponse {
  isFavorited: boolean;
  listType: FavoriteType;
  message: string;
}

export interface FavoriteStatusResponse {
  isWannaGo: boolean;
  isFavorite: boolean;
  isVisited: boolean;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  placeId: string;
  listType: FavoriteType;
  personalNote: string | null;
  createdAt: string;
  place: Place;
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

