class VehicleService {
  constructor(vehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async getVehicles({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    
    // We only return vehicles that are not soft-deleted
    const { rows, count } = await this.vehicleRepository.findAll({
      where: { is_deleted: false },
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });

    return {
      data: rows,
      total: count,
      page,
      limit
    };
  }

  async searchVehicles({ make, model, category, minPrice, maxPrice, page = 1, limit = 20 }) {
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      const { BadRequestError } = require('../../utils/errors');
      throw new BadRequestError('minPrice cannot be greater than maxPrice');
    }

    const { Op } = require('sequelize');
    const offset = (page - 1) * limit;
    
    const where = { is_deleted: false };
    if (make) where.make = { [Op.iLike]: `%${make}%` };
    if (model) where.model = { [Op.iLike]: `%${model}%` };
    if (category) where.category = { [Op.iLike]: `%${category}%` };
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price[Op.gte] = minPrice;
      if (maxPrice !== undefined) where.price[Op.lte] = maxPrice;
    }

    const { rows, count } = await this.vehicleRepository.findAll({
      where,
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });

    return { data: rows, total: count, page, limit };
  }

  async createVehicle(vehicleData) {
    return await this.vehicleRepository.create(vehicleData);
  }

  async updateVehicle(id, vehicleData) {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle || vehicle.is_deleted) {
      const { NotFoundError } = require('../../utils/errors');
      throw new NotFoundError('Vehicle not found');
    }
    await vehicle.update(vehicleData);
    return vehicle;
  }

  async deleteVehicle(id) {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle || vehicle.is_deleted) {
      const { NotFoundError } = require('../../utils/errors');
      throw new NotFoundError('Vehicle not found');
    }
    await vehicle.update({ is_deleted: true });
  }
}

module.exports = { VehicleService };
