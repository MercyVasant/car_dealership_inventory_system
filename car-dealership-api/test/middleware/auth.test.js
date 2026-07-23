const { authMiddleware, authorize } = require('../../src/middleware/auth');
const jwt = require('jsonwebtoken');

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('authMiddleware', () => {
    it('should return 401 if no token is provided', () => {
      authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token missing' });
    });

    it('should return 401 if token is invalid', () => {
      req.headers.authorization = 'Bearer invalidtoken';
      authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    });

    it('should call next and set req.user if token is valid', () => {
      const token = jwt.sign({ id: 'u1', role: 'USER' }, process.env.JWT_SECRET || 'fallback_secret');
      req.headers.authorization = `Bearer ${token}`;
      
      authMiddleware(req, res, next);
      
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('u1');
      expect(req.user.role).toBe('USER');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should return 403 if user role does not match', () => {
      req.user = { role: 'USER' };
      const middleware = authorize('ADMIN');
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Insufficient privileges' });
    });

    it('should call next if user role matches', () => {
      req.user = { role: 'ADMIN' };
      const middleware = authorize('ADMIN');
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });
});
