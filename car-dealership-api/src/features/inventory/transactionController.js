const Joi = require('joi');
const { BadRequestError, ForbiddenError } = require('../../utils/errors');
const { Role } = require('../user/Role');

const createTransactionSchema = Joi.object({
  vehicle_id: Joi.string().uuid().required(),
  type: Joi.string().valid('PURCHASE', 'RESTOCK').required(),
  quantity: Joi.number().integer().min(1).required(),
});

const getTransactionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

class TransactionController {
  constructor(transactionService) {
    this.transactionService = transactionService;
  }

  async createTransaction(req, res) {
    const { error, value } = createTransactionSchema.validate(req.body);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    if (value.type === 'RESTOCK' && req.user.role !== Role.ADMIN) {
      throw new ForbiddenError('Only admins can restock vehicles');
    }

    const transaction = await this.transactionService.processTransaction(req.user.id, value);
    res.status(201).json(transaction);
  }

  async purchase(req, res) {
    const vehicle_id = req.params.id;
    const quantity = req.body?.quantity || 1;
    const transaction = await this.transactionService.processTransaction(req.user.id, {
      vehicle_id,
      type: 'PURCHASE',
      quantity
    });
    res.status(201).json(transaction);
  }

  async restock(req, res) {
    const vehicle_id = req.params.id;
    const quantity = req.body?.quantity || 1;
    const transaction = await this.transactionService.processTransaction(req.user.id, {
      vehicle_id,
      type: 'RESTOCK',
      quantity
    });
    res.status(201).json(transaction);
  }

  async getMyTransactions(req, res) {
    const transactions = await this.transactionService.getUserTransactions(req.user.id);
    res.status(200).json(transactions);
  }

  async getAllTransactions(req, res) {
    const { error, value } = getTransactionsSchema.validate(req.query);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    const result = await this.transactionService.getAllTransactions(value);
    res.status(200).json(result);
  }
}

module.exports = { TransactionController };
