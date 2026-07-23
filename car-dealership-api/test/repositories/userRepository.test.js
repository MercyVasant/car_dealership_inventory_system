const { newDb } = require('pg-mem');
const { Sequelize } = require('sequelize');
// We will import the real repository and model once we build them
// const { UserRepository } = require('../../src/features/user/userRepository');
// const { User } = require('../../src/features/user/User.model');

describe('UserRepository (Real DB via pg-mem)', () => {
  let db;
  let sequelize;
  let User;
  let UserRepository;

  beforeAll(async () => {
    // Create an in-memory PostgreSQL instance
    db = newDb();
    
    // Create a Sequelize instance connected to pg-mem
    sequelize = new Sequelize({
      dialect: 'postgres',
      dialectModule: db.adapters.createPg(),
      logging: false,
    });

    // We will initialize the model here later:
    // User = initUserModel(sequelize);
    // await sequelize.sync({ force: true }); 
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
      
      // Execute (WILL FAIL until implemented)
      const user = await UserRepository.create(userData);

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

      // Ensure mock UserRepository exists for the test to attempt
      if (!UserRepository) {
        throw new Error("UserRepository not implemented");
      }

      await UserRepository.create(userData1);
      
      // The second create should throw due to UNIQUE constraint
      await expect(UserRepository.create(userData2)).rejects.toThrow();
    });
  });
});
