const express = require('express');
const request = require('supertest');
const { errorHandler } = require('../../src/middleware/errorHandler');
const { ApiError, NotFoundError } = require('../../src/utils/errors');

describe('Error Handling Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.get('/success', (req, res) => {
      res.status(200).json({ success: true });
    });

    app.get('/not-found', (req, res, next) => {
      next(new NotFoundError('Resource not found'));
    });

    app.get('/api-error', (req, res, next) => {
      next(new ApiError('Custom API error', 400, 'BAD_REQUEST'));
    });

    app.get('/internal-error', (req, res, next) => {
      next(new Error('Something blew up'));
    });

    // Use our error handler
    app.use(errorHandler);
  });

  it('should handle NotFoundError and return 404 with standard format', async () => {
    const res = await request(app).get('/not-found');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Resource not found');
    expect(res.body).toHaveProperty('status', 404);
    expect(res.body).toHaveProperty('type', 'NotFoundError');
  });

  it('should handle generic ApiError and return appropriate status code', async () => {
    const res = await request(app).get('/api-error');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Custom API error');
    expect(res.body).toHaveProperty('status', 400);
    expect(res.body).toHaveProperty('type', 'BAD_REQUEST');
  });

  it('should handle generic unhandled Errors as 500 Internal Server Error', async () => {
    const res = await request(app).get('/internal-error');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('status', 500);
    // Should not leak stack trace
    expect(res.body.stack).toBeUndefined();
  });
});
