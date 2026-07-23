const { newDb } = require('pg-mem');
const { Sequelize } = require('sequelize');

describe('RefreshTokenRepository (Real DB via pg-mem)', () => {
  let db;
  let sequelize;
  let User;
  let RefreshToken;
  let RefreshTokenRepositoryInstance;

  beforeAll(async () => {
    db = newDb();
    
    sequelize = new Sequelize({
      dialect: 'postgres',
      dialectModule: db.adapters.createPg(),
      logging: false,
    });

    // We will initialize models here later:
    // User = initUserModel(sequelize);
    // RefreshToken = initRefreshTokenModel(sequelize);
    
    // Setup Associations
    // User.hasMany(RefreshToken, { foreignKey: 'user_id' });
    // RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

    // RefreshTokenRepositoryInstance = new RefreshTokenRepository(RefreshToken);
    // await sequelize.sync({ force: true }); 
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  describe('create and find token', () => {
    it('should save a valid refresh token', async () => {
      // Mock failure because it's not implemented yet
      expect(RefreshTokenRepositoryInstance).toBeDefined();
    });

    it('should find token by token string', async () => {
      // Mock failure because it's not implemented yet
      expect(RefreshTokenRepositoryInstance).toBeDefined();
    });

    it('should revoke a token', async () => {
      // Mock failure because it's not implemented yet
      expect(RefreshTokenRepositoryInstance).toBeDefined();
    });
  });
});
