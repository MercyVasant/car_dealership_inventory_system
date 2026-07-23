const express = require('express');
const { VehicleController } = require('./vehicleController');
const { VehicleService } = require('./vehicleService');
const { VehicleRepository } = require('./vehicleRepository');
const { Vehicle } = require('./Vehicle.model');
const { authenticate, authorize } = require('../../middleware/auth');
const { catchAsync } = require('../../utils/catchAsync');

const router = express.Router();

const vehicleRepository = new VehicleRepository(Vehicle);
const vehicleService = new VehicleService(vehicleRepository);
const vehicleController = new VehicleController(vehicleService);

router.post('/', authenticate, authorize('ADMIN'), catchAsync((req, res) => vehicleController.createVehicle(req, res)));
router.get('/', authenticate, catchAsync((req, res) => vehicleController.getVehicles(req, res)));
router.put('/:id', authenticate, authorize('ADMIN'), catchAsync((req, res) => vehicleController.updateVehicle(req, res)));
router.delete('/:id', authenticate, authorize('ADMIN'), catchAsync((req, res) => vehicleController.deleteVehicle(req, res)));

module.exports = router;
