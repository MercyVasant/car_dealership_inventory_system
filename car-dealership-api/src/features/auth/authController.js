const { AuthService } = require('./authService');

const { BadRequestError } = require('../../utils/errors');

// In a real app we'd inject this via a container or router setup,
// but for simplicity we instantiate or just use the class methods directly
class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async register(req, res) {
    const { username, email, password } = req.body;
    
    if (!email || !password || !username) {
      throw new BadRequestError('Missing required fields');
    }

    const user = await this.authService.register({ username, email, password });
    return res.status(201).json({ id: user.id, email: user.email });
  }

  async login(req, res) {
    const { email, password } = req.body;
    const tokens = await this.authService.login(email, password);
    return res.status(200).json(tokens);
  }

  async refresh(req, res) {
    const { token } = req.body;
    if (!token) {
      throw new BadRequestError('Refresh token is required');
    }

    const tokens = await this.authService.refresh(token);
    return res.status(200).json(tokens);
  }

  async logout(req, res) {
    const { token } = req.body;
    if (token) {
      await this.authService.logout(token);
    }
    return res.status(204).send();
  }
}

module.exports = { AuthController };
