const { NotFoundError, BadRequestError } = require('../../utils/errors');

class TransactionService {
  constructor(transactionRepository, vehicleRepository) {
    this.transactionRepository = transactionRepository;
    this.vehicleRepository = vehicleRepository;
  }

  async processTransaction(userId, { vehicle_id, type, quantity }) {
    const vehicle = await this.vehicleRepository.findById(vehicle_id);
    
    if (!vehicle || vehicle.is_deleted) {
      throw new NotFoundError('Vehicle not found');
    }

    if (type === 'PURCHASE') {
      if (vehicle.quantity_in_stock < quantity) {
        throw new BadRequestError('Not enough stock available');
      }
      vehicle.quantity_in_stock -= quantity;
    } else if (type === 'RESTOCK') {
      vehicle.quantity_in_stock += quantity;
    }

    await vehicle.save();

    const transaction = await this.transactionRepository.create({
      user_id: userId,
      vehicle_id: vehicle.id,
      type,
      quantity,
      price_at_time: vehicle.price,
      status: 'SUCCESS'
    });

    return transaction;
  }

  async getUserTransactions(userId) {
    return await this.transactionRepository.findByUserId(userId);
  }

  async getAllTransactions({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.transactionRepository.findAll({ offset, limit, order: [['created_at', 'DESC']] });
    return { data: rows, total: count, page, limit };
  }
}

module.exports = { TransactionService };
