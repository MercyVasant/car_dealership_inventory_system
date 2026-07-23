class UserRepository {
  constructor(userModel) {
    this.User = userModel;
  }

  async create(userData) {
    return await this.User.create(userData);
  }

  async findByEmail(email) {
    return await this.User.findOne({ where: { email } });
  }

  async findById(id) {
    return await this.User.findByPk(id);
  }
}

module.exports = { UserRepository };
