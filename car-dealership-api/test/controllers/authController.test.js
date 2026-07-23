const request = require('supertest');
const express = require('express');

// We will mock the authService so we can test the controller in isolation
const { AuthService } = require('../../src/features/auth/authService');
jest.mock('../../src/features/auth/authService');

const authRoutes = require('../../src/features/auth/routes'); // We'll create this

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('AuthController (Integration)', () => {
  let mockAuthService;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    AuthService.mockClear();
    
    // We get the mocked instance
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn()
    };
    
    // Make the mock constructor return our mock instance
    AuthService.mockImplementation(() => mockAuthService);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201', async () => {
      // Setup mock
      mockAuthService.register.mockResolvedValue({ id: 'u1', email: 'test@test.com' });
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'test@test.com', password: 'password123' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id', 'u1');
      expect(res.body).toHaveProperty('email', 'test@test.com');
    });

    it('should return 400 for validation errors', async () => {
      // Send incomplete data
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'notanemail' });

      expect(res.statusCode).toEqual(400);
    });

    it('should return 409 if user already exists', async () => {
      mockAuthService.register.mockRejectedValue(new Error('User already exists'));
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'exist@test.com', password: 'password123' });

      expect(res.statusCode).toEqual(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login and return tokens', async () => {
      mockAuthService.login.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('accessToken', 'access');
      expect(res.body).toHaveProperty('refreshToken', 'refresh');
    });

    it('should return 401 for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' });

      expect(res.statusCode).toEqual(401);
    });
  });
});
