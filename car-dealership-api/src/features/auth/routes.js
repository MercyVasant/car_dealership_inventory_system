const express = require('express');
const router = express.Router();
const { AuthController } = require('./authController');
const { AuthService } = require('./authService');
const { UserRepository } = require('../user/userRepository');
const { RefreshTokenRepository } = require('./refreshTokenRepository');

const { User, RefreshToken } = require('../../db');

const userRepo = new UserRepository(User);
const refreshTokenRepo = new RefreshTokenRepository(RefreshToken);
const authService = new AuthService(userRepo, refreshTokenRepo);
const authController = new AuthController(authService);

const { catchAsync } = require('../../utils/catchAsync');

// Wrap controller methods in catchAsync to pass unhandled rejections to errorHandler
router.post('/register', catchAsync((req, res) => authController.register(req, res)));
router.post('/login', catchAsync((req, res) => authController.login(req, res)));
router.post('/refresh', catchAsync((req, res) => authController.refresh(req, res)));
router.post('/logout', catchAsync((req, res) => authController.logout(req, res)));

module.exports = router;
