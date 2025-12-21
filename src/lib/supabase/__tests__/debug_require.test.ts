
describe('Debug Require', () => {
  it('should require client module', () => {
    const client = require('../client');
    console.log('Required client keys:', Object.keys(client));
    console.log('getSession:', client.getSession);
  });
});
