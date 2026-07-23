const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ConflictError, UnauthorizedError } = require('../../utils/errors');

class AuthService {
  constructor(userRepository, refreshTokenRepository) {
    this.userRepository = userRepository;
    this.refreshTokenRepository = refreshTokenRepository;
  }

  async register({ username, email, password }) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    const password_hash = await bcrypt.hash(password, 10);
    return await this.userRepository.create({
      username,
      email,
      password_hash,
      role: 'USER'
    });
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refresh(tokenString) {
    const tokenRecord = await this.refreshTokenRepository.findByToken(tokenString);
    
    if (!tokenRecord || tokenRecord.is_revoked) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (new Date() > tokenRecord.expires_at) {
      throw new UnauthorizedError('Refresh token expired');
    }

    const user = tokenRecord.User; // Assumes relationship is loaded, or we fetch it
    const accessToken = this.generateAccessToken(user);
    const refreshTokenString = await this._createRefreshToken(user.id);
    
    // Revoke old token
    await this.refreshTokenRepository.revoke(tokenRecord.id);
    
    return { accessToken, refreshToken: refreshTokenString };
  }

  async logout(tokenString) {
    const tokenRecord = await this.refreshTokenRepository.findByToken(tokenString);
    if (tokenRecord) {
      await this.refreshTokenRepository.revoke(tokenRecord.id);
    }
  }

  generateAccessToken(user) {
    const payload = { id: user.id, email: user.email, role: user.role };
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    return jwt.sign(payload, secret, { expiresIn: '15m' });
  }

  async _createRefreshToken(userId) {
    const refreshTokenString = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepository.create({
      token: refreshTokenString,
      user_id: userId,
      expires_at: expiresAt
    });

    return refreshTokenString;
  }

  async generateTokens(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshTokenString = await this._createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: { id: user.id, email: user.email, role: user.role }
    };
  }
}

module.exports = { AuthService };
