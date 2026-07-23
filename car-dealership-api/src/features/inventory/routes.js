const express = require('express');
const { VehicleController } = require('./vehicleController');
const { VehicleService } = require('./vehicleService');
const { VehicleRepository } = require('./vehicleRepository');
const { Vehicle } = require('./Vehicle.model');

const { TransactionController } = require('./transactionController');
const { TransactionService } = require('./transactionService');
const { TransactionRepository } = require('./transactionRepository');
const { Transaction } = require('./Transaction.model');

const { authMiddleware, authorize } = require('../../middleware/auth');
const { catchAsync } = require('../../utils/catchAsync');

const router = express.Router();

const vehicleRepository = new VehicleRepository(Vehicle);
const vehicleService = new VehicleService(vehicleRepository);
const vehicleController = new VehicleController(vehicleService);

const transactionRepository = new TransactionRepository(Transaction);
const transactionService = new TransactionService(transactionRepository, vehicleRepository);
const transactionController = new TransactionController(transactionService);

// Vehicle Routes
router.post('/vehicles', authMiddleware, authorize('ADMIN'), catchAsync((req, res) => vehicleController.createVehicle(req, res)));
router.get('/vehicles', authMiddleware, catchAsync((req, res) => vehicleController.getVehicles(req, res)));
router.put('/vehicles/:id', authMiddleware, authorize('ADMIN'), catchAsync((req, res) => vehicleController.updateVehicle(req, res)));
router.delete('/vehicles/:id', authMiddleware, authorize('ADMIN'), catchAsync((req, res) => vehicleController.deleteVehicle(req, res)));

// Transaction Routes
router.post('/transactions', authMiddleware, catchAsync((req, res) => transactionController.createTransaction(req, res)));
router.get('/transactions/me', authMiddleware, catchAsync((req, res) => transactionController.getMyTransactions(req, res)));
router.get('/transactions', authMiddleware, authorize('ADMIN'), catchAsync((req, res) => transactionController.getAllTransactions(req, res)));

module.exports = router;
