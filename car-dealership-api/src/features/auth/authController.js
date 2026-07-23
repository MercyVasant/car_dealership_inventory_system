const { AuthService } = require('./authService');

// In a real app we'd inject this via a container or router setup,
// but for simplicity we instantiate or just use the class methods directly
class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      if (!email || !password || !username) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const user = await this.authService.register({ username, email, password });
      return res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
      if (error.message === 'User already exists') {
        return res.status(409).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const tokens = await this.authService.login(email, password);
      return res.status(200).json(tokens);
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async refresh(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const tokens = await this.authService.refresh(token);
      return res.status(200).json(tokens);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  async logout(req, res) {
    try {
      const { token } = req.body;
      if (token) {
        await this.authService.logout(token);
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = { AuthController };
