const request = require('supertest');
const app = require('../src/server');

describe('Security (Integration)', () => {
  it('should enforce CORS for specific origins', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://evil.com');
    
    // For a restricted CORS setup, it should either block the request
    // Our dynamic CORS setup throws a ForbiddenError which results in 403.
    expect(res.statusCode).toBe(403);
    expect(res.text).toContain('The CORS policy for this site does not allow access from the specified Origin.');
  });

  it('should return 429 when rate limit is exceeded on /api/auth/**', async () => {
    // Make max requests + 1
    // Assuming limit is 100 per window
    const maxRequests = 100;
    
    for (let i = 0; i < maxRequests; i++) {
      await request(app).post('/api/auth/login').send({});
    }

    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(429);
  });
});
