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

  async findAll(options = {}) {
    return await this.Vehicle.findAndCountAll(options);
  }
}

module.exports = { VehicleRepository };
