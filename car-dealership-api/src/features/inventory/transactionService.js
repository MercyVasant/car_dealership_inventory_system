class TransactionService {
  constructor(transactionRepository, vehicleRepository) {
    this.transactionRepository = transactionRepository;
    this.vehicleRepository = vehicleRepository;
  }
}

module.exports = { TransactionService };
