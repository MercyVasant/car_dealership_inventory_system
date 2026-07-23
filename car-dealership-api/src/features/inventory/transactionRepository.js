class TransactionRepository {
  constructor(transactionModel) {
    this.Transaction = transactionModel;
  }

  async create(transactionData) {
    return await this.Transaction.create(transactionData);
  }

  async findById(id) {
    return await this.Transaction.findByPk(id);
  }

  async findByUserId(userId) {
    return await this.Transaction.findAll({
      where: {
        user_id: userId
      },
      order: [['created_at', 'DESC']]
    });
  }

  async findAll(options = {}) {
    return await this.Transaction.findAndCountAll(options);
  }
}

module.exports = { TransactionRepository };
