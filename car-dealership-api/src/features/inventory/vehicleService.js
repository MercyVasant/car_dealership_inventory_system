class VehicleService {
  constructor(vehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  async getAllAvailable() {
    return await this.vehicleRepository.findAllAvailable();
  }

  async getVehicleById(id) {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    return vehicle;
  }

  async addVehicle(vehicleData) {
    return await this.vehicleRepository.create(vehicleData);
  }
}

module.exports = { VehicleService };
