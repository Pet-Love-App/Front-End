/**
 * 测试环境配置
 * 为所有测试提供统一的 mock 和工具函数
 *
 * - 使用工厂函数创建测试数据
 * - 提供可复用的 mock 配置
 * - 支持灵活的 mock 覆盖
 */

import '@testing-library/jest-native/extend-expect';

// ==================== Mock Query Builder ====================

/**
 * 创建可链式调用的 Supabase Query Builder mock
 */
export const createMockQueryBuilder = (
  resolveValue: { data: unknown; error: unknown } = { data: null, error: null }
) => {
  const builder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
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
    offset: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolveValue),
    maybeSingle: jest.fn().mockResolvedValue(resolveValue),
    then: jest.fn((resolve) => resolve(resolveValue)),
  };
  return builder;
};

// ==================== Mock Supabase Client ====================

export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    updateUser: jest.fn(),
    getSession: jest.fn(),
    refreshSession: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => createMockQueryBuilder()),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: jest
        .fn()
        .mockReturnValue({ data: { publicUrl: 'https://example.com/image.jpg' } }),
      createSignedUrl: jest
        .fn()
        .mockResolvedValue({ data: { signedUrl: 'https://example.com/signed' }, error: null }),
    })),
  },
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  })),
  removeChannel: jest.fn(),
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

// ==================== Mock Reputation Data ====================

export const createMockReputation = (overrides = {}) => ({
  userId: 'test-user-id',
  score: 45,
  level: 'intermediate' as const,
  profileCompleteness: 80,
  reviewQuality: 50,
  communityContribution: 30,
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// ==================== Mock Forum Data ====================

export const createMockPost = (overrides = {}) => ({
  id: 'test-post-id',
  title: 'Test Post',
  content: 'Test post content',
  author_id: 'test-user-id',
  like_count: 10,
  comment_count: 5,
  view_count: 100,
  images: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  author: createMockProfile(),
  ...overrides,
});

// ==================== Mock Session ====================

export const createMockSession = (overrides = {}) => ({
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: createMockUser(),
  ...overrides,
});

// ==================== 重置所有 mocks ====================

export const resetAllMocks = () => {
  jest.clearAllMocks();

  // 重置 auth mocks
  Object.values(mockSupabaseClient.auth).forEach((fn) => {
    if (typeof fn === 'function') {
      (fn as jest.Mock).mockReset();
    }
  });

  // 重新设置 onAuthStateChange 的默认实现
  mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });

  // 重新设置 from 的默认实现
  (mockSupabaseClient.from as jest.Mock).mockImplementation(() => createMockQueryBuilder());

  // 重新设置 rpc 的默认实现
  (mockSupabaseClient.rpc as jest.Mock).mockResolvedValue({ data: null, error: null });

  // 重新设置 storage 的默认实现
  mockSupabaseClient.storage.from.mockImplementation(() => ({
    upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
    download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
    remove: jest.fn().mockResolvedValue({ data: null, error: null }),
    getPublicUrl: jest
      .fn()
      .mockReturnValue({ data: { publicUrl: 'https://example.com/image.jpg' } }),
    createSignedUrl: jest
      .fn()
      .mockResolvedValue({ data: { signedUrl: 'https://example.com/signed' }, error: null }),
  }));
};

// ==================== Mock Response Helpers ====================

/**
 * 创建成功响应
 */
export const mockSuccessResponse = <T>(data: T) => ({
  data,
  error: null,
});

/**
 * 创建错误响应
 */
export const mockErrorResponse = (message: string, code = 'ERROR') => ({
  data: null,
  error: {
    message,
    code,
    details: '',
    hint: '',
    name: 'PostgrestError',
  },
});

// ==================== Setup Mock Implementations ====================

/**
 * 设置 Supabase from() 方法的 mock 实现
 */
export const setupFromMock = (
  tableName: string,
  resolveValue: { data: unknown; error: unknown }
) => {
  (mockSupabaseClient.from as jest.Mock).mockImplementation((table: string) => {
    if (table === tableName) {
      return createMockQueryBuilder(resolveValue);
    }
    return createMockQueryBuilder();
  });
};

/**
 * 设置 RPC 方法的 mock 实现
 */
export const setupRpcMock = (fnName: string, resolveValue: { data: unknown; error: unknown }) => {
  (mockSupabaseClient.rpc as jest.Mock).mockImplementation((name: string) => {
    if (name === fnName) {
      return Promise.resolve(resolveValue);
    }
    return Promise.resolve({ data: null, error: null });
  });
};
