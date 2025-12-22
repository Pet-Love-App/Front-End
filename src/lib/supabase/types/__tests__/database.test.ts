import { DbUser, DbPet } from '../database';

describe('Database Types', () => {
  it('should allow valid DbUser object', () => {
    const user: DbUser = {
      id: '123',
      username: 'testuser',
      avatar_url: null,
      created_at: '2023-01-01T00:00:00Z',
    };
    expect(user.id).toBe('123');
  });

  it('should allow valid DbPet object', () => {
    const pet: DbPet = {
      id: 1,
      user_id: '123',
      name: 'Fluffy',
      species: 'cat',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };
    expect(pet.name).toBe('Fluffy');
  });
});
