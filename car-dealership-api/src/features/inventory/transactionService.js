class TransactionService {
  constructor(transactionRepository, vehicleRepository) {
    this.transactionRepository = transactionRepository;
    this.vehicleRepository = vehicleRepository;
  }

  async purchaseVehicle(userId, vehicleId) {
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    if (vehicle.status !== 'AVAILABLE') {
      throw new Error('Vehicle is not available for purchase');
    }

    // Process the purchase (simplified)
    vehicle.status = 'SOLD';
    await vehicle.save();

    const transaction = await this.transactionRepository.create({
      buyer_id: userId,
      vehicle_id: vehicleId,
      sale_price: vehicle.price,
      status: 'COMPLETED'
    });

    return transaction;
  }

  async getUserTransactions(userId) {
    return await this.transactionRepository.findByUserId(userId);
  }
}

module.exports = { TransactionService };
