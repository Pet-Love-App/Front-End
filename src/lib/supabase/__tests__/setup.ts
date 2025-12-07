/**
 * 测试环境配置
 * 为所有测试提供统一的 mock 和工具函数
 */

import '@testing-library/jest-native/extend-expect';

// Mock Supabase Client
export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    updateUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      getPublicUrl: jest.fn(),
      createSignedUrl: jest.fn(),
    })),
  },
  rpc: jest.fn(),
};

// Mock Supabase Module
jest.mock('@/src/lib/supabase/client', () => ({
  supabase: mockSupabaseClient,
  isSupabaseConfigured: jest.fn(() => true),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// 全局测试工具函数
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockProfile = (overrides = {}) => ({
  id: 'test-profile-id',
  user_id: 'test-user-id',
  username: 'testuser',
  avatar_url: null,
  bio: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockCatfood = (overrides = {}) => ({
  id: 'test-catfood-id',
  name: 'Test Cat Food',
  brand: 'Test Brand',
  description: 'Test description',
  price: 99.99,
  image_url: 'https://example.com/image.jpg',
  like_count: 10,
  crude_protein: 30,
  crude_fat: 15,
  carbohydrates: 40,
  crude_fiber: 5,
  crude_ash: 8,
  others: 2,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockComment = (overrides = {}) => ({
  id: 'test-comment-id',
  content: 'Test comment',
  author_id: 'test-user-id',
  catfood_id: 'test-catfood-id',
  parent_id: null,
  like_count: 5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  author: createMockProfile(),
  ...overrides,
});

export const createMockPet = (overrides = {}) => ({
  id: 'test-pet-id',
  user_id: 'test-user-id',
  name: 'Test Pet',
  breed: 'British Shorthair',
  age: 2,
  weight: 5.5,
  gender: 'male',
  photo_url: 'https://example.com/pet.jpg',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// 重置所有 mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  Object.values(mockSupabaseClient.auth).forEach((fn) => {
    if (typeof fn === 'function') {
      (fn as jest.Mock).mockReset();
    }
  });
};
