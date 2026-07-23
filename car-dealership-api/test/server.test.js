const request = require('supertest');
const app = require('../src/server');

describe('Security (Integration)', () => {
  it('should enforce CORS for specific origins', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://evil.com');
    
    // For a restricted CORS setup, it should either block the request
    // or not return the Access-Control-Allow-Origin header for evil.com.
    // Usually with cors package, if origin is not allowed, it sets no ACAO header.
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
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
