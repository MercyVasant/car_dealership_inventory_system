const { newDb } = require('pg-mem');
const { Sequelize } = require('sequelize');
const { RefreshTokenRepository } = require('../../src/features/auth/refreshTokenRepository');
const { initRefreshTokenModel } = require('../../src/features/auth/RefreshToken.model');
const { initUserModel } = require('../../src/features/user/User.model');

describe('RefreshTokenRepository (Real DB via pg-mem)', () => {
  let db;
  let sequelize;
  let User;
  let RefreshToken;
  let RefreshTokenRepositoryInstance;
  let testUser;

  beforeAll(async () => {
    db = newDb();
    
    sequelize = new Sequelize({
      dialect: 'postgres',
      dialectModule: db.adapters.createPg(),
      logging: false,
    });

    User = initUserModel(sequelize);
    RefreshToken = initRefreshTokenModel(sequelize);
    
    // Setup Associations
    User.hasMany(RefreshToken, { foreignKey: 'user_id' });
    RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

    RefreshTokenRepositoryInstance = new RefreshTokenRepository(RefreshToken);
    
    await sequelize.sync({ force: true }); 

    // Create a dummy user for foreign key constraint
    testUser = await User.create({
      username: 'tokenuser',
      email: 'tokenuser@example.com',
      password_hash: 'hash',
      role: 'USER'
    });
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  describe('create and find token', () => {
    const tokenString = 'sample-refresh-token-123';
    
    it('should save a valid refresh token', async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // expires in 7 days

      const tokenData = {
        token: tokenString,
        user_id: testUser.id,
        expires_at: expiresAt
      };
      
      const tokenRecord = await RefreshTokenRepositoryInstance.create(tokenData);

      expect(tokenRecord.id).toBeDefined();
      expect(tokenRecord.token).toBe(tokenString);
      expect(tokenRecord.is_revoked).toBe(false);
      expect(tokenRecord.user_id).toBe(testUser.id);
    });

    it('should find token by token string', async () => {
      const result = await RefreshTokenRepositoryInstance.findByToken(tokenString);
      expect(result).toBeDefined();
      expect(result.token).toBe(tokenString);
    });

    it('should return null for non-existent token', async () => {
      const result = await RefreshTokenRepositoryInstance.findByToken('non-existent-token');
      expect(result).toBeNull();
    });

    it('should revoke a token', async () => {
      const isRevoked = await RefreshTokenRepositoryInstance.revoke(tokenString);
      expect(isRevoked).toBe(true);

      const result = await RefreshTokenRepositoryInstance.findByToken(tokenString);
      expect(result.is_revoked).toBe(true);
    });

    it('should return false when revoking non-existent token', async () => {
      const isRevoked = await RefreshTokenRepositoryInstance.revoke('non-existent-token');
      expect(isRevoked).toBe(false);
    });
  });
});
