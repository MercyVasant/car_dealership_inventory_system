const { AuthService } = require('../../src/features/auth/authService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let mockUserRepo;
  let mockTokenRepo;
  let authService;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    mockTokenRepo = {
      create: jest.fn(),
      findByToken: jest.fn(),
      revoke: jest.fn(),
    };
    authService = new AuthService(mockUserRepo, mockTokenRepo);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw an error if user already exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: 'u1' });
      await expect(authService.register({ email: 'test@test.com' })).rejects.toThrow('User already exists');
    });

    it('should hash password and create user', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_pw');
      mockUserRepo.create.mockResolvedValue({ id: 'u2', email: 'new@test.com' });

      const result = await authService.register({ email: 'new@test.com', password: 'password123', username: 'newuser' });
      expect(result.id).toBe('u2');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        email: 'new@test.com',
        username: 'newuser',
        password_hash: 'hashed_pw',
        role: 'USER'
      });
    });
  });

  describe('login', () => {
    it('should throw error if user not found', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      await expect(authService.login('notfound@test.com', 'pw')).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password does not match', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: 'u1', password_hash: 'hash' });
      bcrypt.compare.mockResolvedValue(false);
      await expect(authService.login('user@test.com', 'wrongpw')).rejects.toThrow('Invalid credentials');
    });

    it('should return access and refresh tokens on valid credentials', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: 'u1', email: 'user@test.com', role: 'USER', password_hash: 'hash' });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('access_token_123');
      mockTokenRepo.create.mockResolvedValue({ token: 'refresh_token_123' });

      const result = await authService.login('user@test.com', 'correctpw');
      
      expect(result.accessToken).toBe('access_token_123');
      expect(result.refreshToken).toBeDefined();
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockTokenRepo.create).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should throw an error for invalid refresh token', async () => {
      mockTokenRepo.findByToken.mockResolvedValue(null);
      await expect(authService.refresh('invalid_token')).rejects.toThrow('Invalid refresh token');
    });

    it('should throw an error if token is revoked', async () => {
      mockTokenRepo.findByToken.mockResolvedValue({ is_revoked: true });
      await expect(authService.refresh('revoked_token')).rejects.toThrow('Invalid refresh token');
    });

    it('should throw an error if token is expired', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      mockTokenRepo.findByToken.mockResolvedValue({ is_revoked: false, expires_at: pastDate });
      await expect(authService.refresh('expired_token')).rejects.toThrow('Refresh token expired');
    });

    it('should return a new access token for a valid refresh token', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      mockTokenRepo.findByToken.mockResolvedValue({
        is_revoked: false,
        expires_at: futureDate,
        User: { id: 'u1', email: 'user@test.com', role: 'USER' }
      });
      jwt.sign.mockReturnValue('new_access_token');

      const result = await authService.refresh('valid_token');
      expect(result.accessToken).toBe('new_access_token');
      expect(jwt.sign).toHaveBeenCalled();
    });
  });
});
