const request = require('supertest');
const express = require('express');
const { AuthController } = require('../../src/features/auth/authController');
const { ConflictError, UnauthorizedError } = require('../../src/utils/errors');
const { catchAsync } = require('../../src/utils/catchAsync');
const { errorHandler } = require('../../src/middleware/errorHandler');

describe('AuthController (Integration)', () => {
  let mockAuthService;
  let app;

  beforeEach(() => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn()
    };
    
    const authController = new AuthController(mockAuthService);
    
    app = express();
    app.use(express.json());
    app.post('/api/auth/register', catchAsync((req, res) => authController.register(req, res)));
    app.post('/api/auth/login', catchAsync((req, res) => authController.login(req, res)));
    app.post('/api/auth/refresh', catchAsync((req, res) => authController.refresh(req, res)));
    app.post('/api/auth/logout', catchAsync((req, res) => authController.logout(req, res)));
    app.use(errorHandler);
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
      mockAuthService.register.mockRejectedValue(new ConflictError('User already exists'));
      
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
      mockAuthService.login.mockRejectedValue(new UnauthorizedError('Invalid credentials'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token and return new access token', async () => {
      mockAuthService.refresh.mockResolvedValue({ accessToken: 'new_access' });

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ token: 'valid_refresh' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('accessToken', 'new_access');
    });

    it('should return 401 for invalid refresh token', async () => {
      mockAuthService.refresh.mockRejectedValue(new UnauthorizedError('Invalid refresh token'));

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ token: 'invalid' });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should call authService.logout and return 204', async () => {
      mockAuthService.logout.mockResolvedValue();

      const res = await request(app)
        .post('/api/auth/logout')
        .send({ token: 'valid_refresh' });

      expect(res.statusCode).toEqual(204);
      expect(mockAuthService.logout).toHaveBeenCalledWith('valid_refresh');
    });

    it('should return 500 if logout fails', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .post('/api/auth/logout')
        .send({ token: 'valid_refresh' });

      expect(res.statusCode).toEqual(500);
    });
  });
});
