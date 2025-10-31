describe('Example Test Suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const greeting = 'Hello World';
    expect(greeting).toContain('World');
    expect(greeting.length).toBeGreaterThan(0);
  });

  it('should work with arrays', () => {
    const pets = ['cat', 'dog', 'bird'];
    expect(pets).toHaveLength(3);
    expect(pets).toContain('cat');
  });
});

