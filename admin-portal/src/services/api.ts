import {
  AdminStats,
  Place,
  TrashData,
  UserItem,
  UserDetail,
  CategoryItem,
  CommentItem,
  ProvinceItem,
  DistrictItem,
  RankedPlace,
  BannerItem,
} from '../types';

const API_BASE = 'http://localhost:4000/api/v1';

export const authStorage = {
  getToken: () => localStorage.getItem('wtg_admin_token'),
  getRefreshToken: () => localStorage.getItem('wtg_admin_refresh_token'),
  setToken: (token: string, refreshToken?: string) => {
    localStorage.setItem('wtg_admin_token', token);
    if (refreshToken) {
      localStorage.setItem('wtg_admin_refresh_token', refreshToken);
    }
  },
  clearToken: () => {
    localStorage.removeItem('wtg_admin_token');
    localStorage.removeItem('wtg_admin_refresh_token');
    localStorage.removeItem('wtg_admin_user');
  },
  getUser: () => {
    const s = localStorage.getItem('wtg_admin_user');
    return s ? JSON.parse(s) : null;
  },
  setUser: (u: any) => localStorage.setItem('wtg_admin_user', JSON.stringify(u)),
};

// In-flight request deduplication and cache map
const inFlightRequests = new Map<string, Promise<any>>();
const apiCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 15000; // 15 seconds

export const clearApiCache = () => {
  apiCache.clear();
};

// In-flight refresh token promise mutex
let activeRefreshPromise: Promise<string | null> | null = null;

async function rawAdminRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized via single-flight Refresh Token mutex
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (!activeRefreshPromise) {
      activeRefreshPromise = (async () => {
        const refreshToken = authStorage.getRefreshToken() || authStorage.getToken();
        if (!refreshToken) return null;
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const newTokens = await refreshRes.json();
            authStorage.setToken(newTokens.accessToken, newTokens.refreshToken);
            return newTokens.accessToken as string;
          } else {
            authStorage.clearToken();
            localStorage.removeItem('wtg_admin_user');
            return null;
          }
        } catch {
          authStorage.clearToken();
          localStorage.removeItem('wtg_admin_user');
          return null;
        } finally {
          activeRefreshPromise = null;
        }
      })();
    }

    const newAccessToken = await activeRefreshPromise;
    if (newAccessToken) {
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      // Retry original request with newly refreshed token
      const retryRes = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
      if (!retryRes.ok) {
        const errData = await retryRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Request failed after token refresh');
      }
      return retryRes.json();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return response.json();
}

async function adminRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();

  // If writing data, invalidate cache
  if (method !== 'GET') {
    apiCache.clear();
    return rawAdminRequest<T>(endpoint, options);
  }

  // 1. Check in-memory cache
  const cached = apiCache.get(endpoint);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Check in-flight duplicate requests (deduplicate identical concurrent calls)
  if (inFlightRequests.has(endpoint)) {
    return inFlightRequests.get(endpoint)!;
  }

  // 3. Initiate request and track in-flight
  const promise = rawAdminRequest<T>(endpoint, options)
    .then((data) => {
      apiCache.set(endpoint, { timestamp: Date.now(), data });
      inFlightRequests.delete(endpoint);
      return data;
    })
    .catch((err) => {
      inFlightRequests.delete(endpoint);
      throw err;
    });

  inFlightRequests.set(endpoint, promise);
  return promise;
}

export const adminApi = {
  clearCache: clearApiCache,

  login: async (identifier = 'admin', password = 'Admin@123456') => {
    const res = await rawAdminRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    authStorage.setToken(res.tokens.accessToken, res.tokens.refreshToken);
    authStorage.setUser(res.user);
    apiCache.clear();
    return res;
  },

  logout: async () => {
    try {
      await rawAdminRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors during logout
    } finally {
      authStorage.clearToken();
      apiCache.clear();
    }
  },

  getStats: (): Promise<AdminStats> => adminRequest('/admin/stats'),

  getPendingPlaces: (page = 1, limit = 50): Promise<{ items: Place[]; meta: any }> =>
    adminRequest(`/admin/places/pending?page=${page}&limit=${limit}`),

  getAllPlaces: (province?: string, categoryId?: number): Promise<{ items: Place[]; meta: any }> => {
    const params = new URLSearchParams();
    if (province && province !== 'ALL') params.set('province', province);
    if (categoryId) params.set('categoryId', categoryId.toString());
    params.set('limit', '100');
    return adminRequest(`/places?${params.toString()}`);
  },

  approvePlace: (id: string): Promise<Place> =>
    adminRequest(`/admin/places/${id}/approve`, { method: 'PATCH' }),

  rejectPlace: (id: string, reason?: string): Promise<Place> =>
    adminRequest(`/admin/places/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  createPlace: (data: any): Promise<Place> =>
    adminRequest('/places', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePlace: (id: string, data: any): Promise<Place> =>
    adminRequest(`/places/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  uploadImage: async (file: File): Promise<{ url: string; thumbnailUrl: string }> => {
    let token = authStorage.getToken();
    const formData = new FormData();
    formData.append('file', file);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (res.status === 401) {
      // Try refresh
      const refreshToken = authStorage.getRefreshToken() || authStorage.getToken();
      if (refreshToken) {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const newTokens = await refreshRes.json();
          authStorage.setToken(newTokens.accessToken, newTokens.refreshToken);
          headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
          res = await fetch(`${API_BASE}/upload/image`, {
            method: 'POST',
            headers,
            body: formData,
          });
        }
      }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Image upload failed');
    }
    return res.json();
  },

  softDeletePlace: (id: string): Promise<any> =>
    adminRequest(`/places/${id}`, { method: 'DELETE' }),

  getTrash: (): Promise<TrashData> => adminRequest('/admin/trash'),

  restorePlace: (id: string): Promise<Place> =>
    adminRequest(`/admin/trash/places/${id}/restore`, { method: 'PATCH' }),

  restoreComment: (id: string): Promise<any> =>
    adminRequest(`/admin/trash/comments/${id}/restore`, { method: 'PATCH' }),

  restoreUser: (id: string): Promise<any> =>
    adminRequest(`/admin/trash/users/${id}/restore`, { method: 'PATCH' }),

  hardDeletePlace: (id: string): Promise<any> =>
    adminRequest(`/admin/trash/places/${id}/permanent`, { method: 'DELETE' }),

  hardDeleteUser: (userId: string): Promise<any> =>
    adminRequest(`/admin/trash/users/${userId}/permanent`, { method: 'DELETE' }),

  // --- User Management Module with Relationships ---
  getUsers: (q?: string): Promise<UserItem[]> => {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    return adminRequest(`/admin/users${params}`);
  },

  getUserDetail: (userId: string): Promise<UserDetail> =>
    adminRequest(`/admin/users/${userId}`),

  createUser: (data: {
    username: string;
    phoneNumber: string;
    displayName: string;
    password: string;
    role?: string;
    avatarUrl?: string;
  }): Promise<UserItem> =>
    adminRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUser: (
    userId: string,
    data: {
      displayName?: string;
      username?: string;
      phoneNumber?: string;
      role?: string;
      password?: string;
      avatarUrl?: string;
    },
  ): Promise<UserItem> =>
    adminRequest(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateUserRole: (userId: string, role: string): Promise<UserItem> =>
    adminRequest(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  softDeleteUser: (userId: string): Promise<any> =>
    adminRequest(`/admin/users/${userId}`, { method: 'DELETE' }),

  // --- Category Management Module ---
  getCategories: (): Promise<CategoryItem[]> => adminRequest('/categories'),

  createCategory: (data: {
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    sortOrder?: number;
  }): Promise<CategoryItem> =>
    adminRequest('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategory: (
    id: number,
    data: {
      name?: string;
      slug?: string;
      icon?: string;
      description?: string;
      sortOrder?: number;
    },
  ): Promise<CategoryItem> =>
    adminRequest(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  softDeleteCategory: (id: number): Promise<any> =>
    adminRequest(`/admin/categories/${id}`, { method: 'DELETE' }),

  // --- Provinces & Districts Module ---
  getProvinces: (): Promise<ProvinceItem[]> => adminRequest('/provinces'),

  getProvinceDetail: (idOrSlug: string): Promise<ProvinceItem> =>
    adminRequest(`/provinces/${idOrSlug}`),

  createProvince: (data: {
    code: string;
    nameLo: string;
    nameEn: string;
    slug: string;
    highlight?: string;
  }): Promise<ProvinceItem> =>
    adminRequest('/provinces', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProvince: (
    id: number,
    data: {
      code?: string;
      nameLo?: string;
      nameEn?: string;
      slug?: string;
      highlight?: string;
    },
  ): Promise<ProvinceItem> =>
    adminRequest(`/provinces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteProvince: (id: number): Promise<any> =>
    adminRequest(`/provinces/${id}`, { method: 'DELETE' }),

  getDistricts: (provinceId: number): Promise<DistrictItem[]> =>
    adminRequest(`/provinces/${provinceId}/districts`),

  createDistrict: (
    provinceId: number,
    data: {
      nameLo: string;
      nameEn: string;
      slug: string;
      code?: string;
    },
  ): Promise<DistrictItem> =>
    adminRequest(`/provinces/${provinceId}/districts`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDistrict: (
    districtId: number,
    data: {
      nameLo?: string;
      nameEn?: string;
      slug?: string;
      code?: string;
    },
  ): Promise<DistrictItem> =>
    adminRequest(`/provinces/districts/${districtId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteDistrict: (districtId: number): Promise<any> =>
    adminRequest(`/provinces/districts/${districtId}`, { method: 'DELETE' }),

  // --- Comment Moderation Module ---
  getComments: (page = 1, limit = 50): Promise<{ items: CommentItem[]; total: number }> =>
    adminRequest(`/admin/comments?page=${page}&limit=${limit}`),

  deleteComment: (commentId: string): Promise<any> =>
    adminRequest(`/comments/${commentId}`, { method: 'DELETE' }),

  // --- Top Post Rank Tier Module ---
  getRankings: (limit = 20): Promise<RankedPlace[]> =>
    adminRequest(`/admin/rankings?limit=${limit}`),

  // --- Banner Slider Module ---
  getBanners: (): Promise<BannerItem[]> => adminRequest('/banners'),

  createBanner: (data: Partial<BannerItem>): Promise<BannerItem> =>
    adminRequest('/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateBanner: (id: string, data: Partial<BannerItem>): Promise<BannerItem> =>
    adminRequest(`/banners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  toggleBannerActive: (id: string): Promise<BannerItem> =>
    adminRequest(`/banners/${id}/toggle-active`, { method: 'PATCH' }),

  deleteBanner: (id: string): Promise<any> =>
    adminRequest(`/banners/${id}`, { method: 'DELETE' }),
};

