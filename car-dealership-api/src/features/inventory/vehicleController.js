const Joi = require('joi');
const { BadRequestError } = require('../../utils/errors');

const createVehicleSchema = Joi.object({
  make: Joi.string().required(),
  model: Joi.string().required(),
  category: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity_in_stock: Joi.number().integer().min(0).required(),
  image_url: Joi.string().uri().optional().allow(null, '')
});

const getVehiclesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

class VehicleController {
  constructor(vehicleService) {
    this.vehicleService = vehicleService;
  }

  async createVehicle(req, res) {
    const { error, value } = createVehicleSchema.validate(req.body);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    const vehicle = await this.vehicleService.createVehicle(value);
    res.status(201).json(vehicle);
  }

  async searchVehicles(req, res) {
    const searchSchema = Joi.object({
      make: Joi.string().optional(),
      model: Joi.string().optional(),
      category: Joi.string().optional(),
      minPrice: Joi.number().min(0).optional(),
      maxPrice: Joi.number().min(0).optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    });

    const { error, value } = searchSchema.validate(req.query);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    const result = await this.vehicleService.searchVehicles(value);
    res.status(200).json(result);
  }

  async getVehicles(req, res) {
    const { error, value } = getVehiclesSchema.validate(req.query);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    const result = await this.vehicleService.getVehicles(value);
    res.status(200).json(result);
  }
  async updateVehicle(req, res) {
    const { error, value } = createVehicleSchema.validate(req.body);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }
    const vehicle = await this.vehicleService.updateVehicle(req.params.id, value);
    res.status(200).json(vehicle);
  }

  async deleteVehicle(req, res) {
    await this.vehicleService.deleteVehicle(req.params.id);
    res.status(204).send();
  }
}

module.exports = { VehicleController };
