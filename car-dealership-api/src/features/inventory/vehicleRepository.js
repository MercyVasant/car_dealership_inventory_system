class VehicleRepository {
  constructor(vehicleModel) {
    this.Vehicle = vehicleModel;
  }

  async create(vehicleData) {
    return await this.Vehicle.create(vehicleData);
  }

  async findById(id) {
    return await this.Vehicle.findByPk(id);
  }

  async findAllAvailable() {
    return await this.Vehicle.findAll({
      where: {
        status: 'AVAILABLE'
      },
      order: [['created_at', 'DESC']]
    });
  }
}

module.exports = { VehicleRepository };
