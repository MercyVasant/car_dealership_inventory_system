const express = require('express');
const router = express.Router();
const { AuthController } = require('./authController');
const { AuthService } = require('./authService');
const { UserRepository } = require('../user/userRepository');
const { RefreshTokenRepository } = require('./refreshTokenRepository');

// Temporary simplistic injection
const userRepo = new UserRepository();
const refreshTokenRepo = new RefreshTokenRepository();
const authService = new AuthService(userRepo, refreshTokenRepo);
const authController = new AuthController(authService);

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));

module.exports = router;
