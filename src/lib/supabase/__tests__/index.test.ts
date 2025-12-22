import * as supabaseIndex from '../index';

describe('Supabase Index', () => {
  it('should export client functions', () => {
    expect(supabaseIndex.supabase).toBeDefined();
    expect(supabaseIndex.getSession).toBeDefined();
    expect(supabaseIndex.isSupabaseConfigured).toBeDefined();
  });

  it('should export helper functions', () => {
    expect(supabaseIndex.convertKeysToCamel).toBeDefined();
    expect(supabaseIndex.logger).toBeDefined();
    expect(supabaseIndex.wrapResponse).toBeDefined();
  });

  it('should export services', () => {
    expect(supabaseIndex.supabaseAuthService).toBeDefined();
    expect(supabaseIndex.supabaseProfileService).toBeDefined();
    expect(supabaseIndex.supabaseCatfoodService).toBeDefined();
    expect(supabaseIndex.supabasePetService).toBeDefined();
  });
});
