const { newDb } = require('pg-mem');
const { Sequelize } = require('sequelize');
const { UserRepository } = require('../../src/features/user/userRepository');
const { initUserModel } = require('../../src/features/user/User.model');

describe('UserRepository (Real DB via pg-mem)', () => {
  let db;
  let sequelize;
  let User;
  let UserRepositoryInstance;

  beforeAll(async () => {
    // Create an in-memory PostgreSQL instance
    db = newDb();
    
    // Create a Sequelize instance connected to pg-mem
    sequelize = new Sequelize({
      dialect: 'postgres',
      dialectModule: db.adapters.createPg(),
      logging: false,
    });

    // Initialize the model
    User = initUserModel(sequelize);
    UserRepositoryInstance = new UserRepository(User);
    
    await sequelize.sync({ force: true }); 
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  describe('create user', () => {
    it('should save a valid user and return the assigned UUID', async () => {
      // Setup
      const userData = {
        username: 'testuser1',
        email: 'test1@example.com',
        password_hash: 'hashedpassword',
        role: 'USER',
      };
      
      // Execute
      const user = await UserRepositoryInstance.create(userData);

      // Assert
      expect(user.id).toBeDefined();
      expect(user.username).toBe('testuser1');
      expect(user.email).toBe('test1@example.com');
      expect(user.is_active).toBe(true);
    });

    it('should enforce unique email constraint', async () => {
      const userData1 = {
        username: 'userA',
        email: 'duplicate@example.com',
        password_hash: 'hash'
      };
      const userData2 = {
        username: 'userB',
        email: 'duplicate@example.com',
        password_hash: 'hash'
      };

      // No mock check needed, we are using a real instance

      await UserRepositoryInstance.create(userData1);
      
      // The second create should throw due to UNIQUE constraint
      await expect(UserRepositoryInstance.create(userData2)).rejects.toThrow();
    });
  });

  describe('findByEmail and findById', () => {
    let testUser;

    beforeAll(async () => {
      testUser = await UserRepositoryInstance.create({
        username: 'searchuser',
        email: 'search@example.com',
        password_hash: 'hash',
        role: 'USER'
      });
    });

    it('should find user by email', async () => {
      const result = await UserRepositoryInstance.findByEmail('search@example.com');
      expect(result).toBeDefined();
      expect(result.id).toBe(testUser.id);
      expect(result.username).toBe('searchuser');
    });

    it('should return null for non-existent email', async () => {
      const result = await UserRepositoryInstance.findByEmail('doesnotexist@example.com');
      expect(result).toBeNull();
    });

    it('should find user by id', async () => {
      const result = await UserRepositoryInstance.findById(testUser.id);
      expect(result).toBeDefined();
      expect(result.email).toBe('search@example.com');
    });

    it('should return null for non-existent id', async () => {
      const { randomUUID } = require('crypto');
      const result = await UserRepositoryInstance.findById(randomUUID());
      expect(result).toBeNull();
    });
  });
});
