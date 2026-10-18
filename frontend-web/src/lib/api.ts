import {
  AuthResponse,
  Category,
  CreateCommentDto,
  CreatePlaceDto,
  FavoriteItem,
  FavoriteStatusResponse,
  LoginDto,
  PaginatedResponse,
  Place,
  PlaceComment,
  QueryPlacesDto,
  RegisterDto,
  ToggleFavoriteDto,
  ToggleFavoriteResponse,
  UpdatePlaceDto,
  UploadResponse,
  Province,
  District,
  User,
} from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

// Token helper methods
export const tokenStorage = {
  getAccessToken: () => (typeof window !== 'undefined' ? localStorage.getItem('wtg_access_token') : null),
  getRefreshToken: () => (typeof window !== 'undefined' ? localStorage.getItem('wtg_refresh_token') : null),
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wtg_access_token', accessToken);
      localStorage.setItem('wtg_refresh_token', refreshToken);
    }
  },
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wtg_access_token');
      localStorage.removeItem('wtg_refresh_token');
      localStorage.removeItem('wtg_user');
    }
  },
  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wtg_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  },
  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wtg_user', JSON.stringify(user));
    }
  },
};

// Generic fetch client with automatic PS512 bearer auth
// In-flight refresh token mutex for public web
let activeWebRefreshPromise: Promise<string | null> | null = null;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle Token expiration / 401 Unauthorized via single-flight refresh mutex
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (!activeWebRefreshPromise) {
      activeWebRefreshPromise = (async () => {
        const refreshToken = tokenStorage.getRefreshToken() || tokenStorage.getAccessToken();
        if (!refreshToken) return null;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const newTokens = await refreshRes.json();
            tokenStorage.setTokens(newTokens.accessToken, newTokens.refreshToken);
            return newTokens.accessToken as string;
          } else {
            tokenStorage.clearTokens();
            return null;
          }
        } catch {
          tokenStorage.clearTokens();
          return null;
        } finally {
          activeWebRefreshPromise = null;
        }
      })();
    }

    const newAccessToken = await activeWebRefreshPromise;
    if (newAccessToken) {
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      // Retry original request
      const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      if (!retryRes.ok) {
        const errData = await retryRes.json().catch(() => ({}));
        throw new ApiError(errData.message || 'Request failed', retryRes.status);
      }
      return retryRes.json();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(message, response.status);
  }

  return response.json();
}

async function uploadWithAuth(endpoint: string, formData: FormData) {
  let token = tokenStorage.getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401) {
    const refreshToken = tokenStorage.getRefreshToken() || tokenStorage.getAccessToken();
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const newTokens = await refreshRes.json();
        tokenStorage.setTokens(newTokens.accessToken, newTokens.refreshToken);
        headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
        res = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers,
          body: formData,
        });
      }
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message || 'Image upload failed', res.status);
  }
  return res.json();
}

export const api = {
  // Authentication
  auth: {
    register: (dto: RegisterDto): Promise<AuthResponse> =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(dto) }),

    login: (dto: LoginDto): Promise<AuthResponse> =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(dto) }),

    logout: (): Promise<{ success: boolean; message: string }> =>
      request('/auth/logout', { method: 'POST' }),

    me: (): Promise<User> => request('/auth/me'),
  },

  // Categories
  categories: {
    list: (): Promise<Category[]> => request('/categories'),
    get: (slug: string): Promise<Category> => request(`/categories/${slug}`),
  },

  // Provinces & Districts
  provinces: {
    list: (): Promise<Province[]> => request('/provinces'),
    get: (idOrSlug: string): Promise<Province> => request(`/provinces/${idOrSlug}`),
    districts: (provinceId: number): Promise<District[]> => request(`/provinces/${provinceId}/districts`),
  },

  // Image Upload (WebP conversion)
  upload: {
    single: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);
      return uploadWithAuth('/upload/image', formData);
    },

    multiple: async (files: File[]): Promise<UploadResponse[]> => {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      return uploadWithAuth('/upload/images', formData);
    },
  },

  // Places
  places: {
    list: (query: QueryPlacesDto = {}): Promise<PaginatedResponse<Place>> => {
      const params = new URLSearchParams();
      if (query.q) params.set('q', query.q);
      if (query.search) params.set('search', query.search);
      if (query.province && query.province !== 'ALL') params.set('province', query.province);
      if (query.provinceId) params.set('provinceId', query.provinceId.toString());
      if (query.districtId) params.set('districtId', query.districtId.toString());
      if (query.category) params.set('category', query.category);
      if (query.categoryId) params.set('categoryId', query.categoryId.toString());
      if (query.sort) params.set('sort', query.sort);
      params.set('page', (query.page || 1).toString());
      params.set('limit', (query.limit || 20).toString());
      if (query.offset !== undefined) params.set('offset', query.offset.toString());
      const qs = params.toString();
      return request(`/places${qs ? `?${qs}` : ''}`);
    },

    get: (slugOrId: string): Promise<Place> => request(`/places/${slugOrId}`),

    submit: (dto: CreatePlaceDto): Promise<Place> =>
      request('/places', { method: 'POST', body: JSON.stringify(dto) }),

    update: (id: string, dto: UpdatePlaceDto): Promise<Place> =>
      request(`/places/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),

    myPlaces: (): Promise<Place[]> => request('/places/user/my-places'),

    delete: (id: string): Promise<{ success: boolean }> =>
      request(`/places/${id}`, { method: 'DELETE' }),
  },

  // Comments
  comments: {
    list: (placeId: string, page = 1, limit = 20): Promise<PaginatedResponse<PlaceComment>> =>
      request(`/places/${placeId}/comments?page=${page}&limit=${limit}`),

    add: (placeId: string, dto: CreateCommentDto): Promise<PlaceComment> =>
      request(`/places/${placeId}/comments`, { method: 'POST', body: JSON.stringify(dto) }),

    delete: (placeId: string, commentId: string): Promise<{ success: boolean }> =>
      request(`/places/${placeId}/comments/${commentId}`, { method: 'DELETE' }),
  },

  // Favorites & "I Wanna Go"
  favorites: {
    toggle: (placeId: string, dto: ToggleFavoriteDto = {}): Promise<ToggleFavoriteResponse> =>
      request(`/places/${placeId}/favorite`, { method: 'POST', body: JSON.stringify(dto) }),

    status: (placeId: string): Promise<FavoriteStatusResponse> =>
      request(`/places/${placeId}/favorite/status`),

    myBucketList: (type?: string): Promise<FavoriteItem[]> =>
      request(`/users/me/bucket-list${type ? `?type=${type}` : ''}`),
  },
};
