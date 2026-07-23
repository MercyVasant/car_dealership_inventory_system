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
