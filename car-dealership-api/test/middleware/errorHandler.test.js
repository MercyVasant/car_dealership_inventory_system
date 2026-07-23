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
    app.get('/api-error-default', (req, res, next) => {
      next(new ApiError('Default API error', 500));
    });

    const { BadRequestError, UnauthorizedError, ForbiddenError } = require('../../src/utils/errors');
    app.get('/bad-request', (req, res, next) => next(new BadRequestError()));
    app.get('/bad-request-custom', (req, res, next) => next(new BadRequestError('Custom bad req')));
    app.get('/unauthorized', (req, res, next) => next(new UnauthorizedError()));
    app.get('/unauthorized-custom', (req, res, next) => next(new UnauthorizedError('Custom unauth')));
    app.get('/forbidden', (req, res, next) => next(new ForbiddenError()));
    app.get('/forbidden-custom', (req, res, next) => next(new ForbiddenError('Custom forbidden')));
    app.get('/not-found-custom', (req, res, next) => next(new NotFoundError('Custom not found')));

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
    let res = await request(app).get('/api-error');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Custom API error');
    expect(res.body).toHaveProperty('status', 400);
    expect(res.body).toHaveProperty('type', 'BAD_REQUEST');

    res = await request(app).get('/api-error-default');
    expect(res.body.type).toBe('INTERNAL_ERROR');
  });

  it('should handle BadRequestError', async () => {
    let res = await request(app).get('/bad-request');
    expect(res.statusCode).toBe(400);
    expect(res.body.type).toBe('BadRequestError');

    res = await request(app).get('/bad-request-custom');
    expect(res.body.error).toBe('Custom bad req');
  });

  it('should handle UnauthorizedError', async () => {
    let res = await request(app).get('/unauthorized');
    expect(res.statusCode).toBe(401);
    expect(res.body.type).toBe('UnauthorizedError');

    res = await request(app).get('/unauthorized-custom');
    expect(res.body.error).toBe('Custom unauth');
  });

  it('should handle ForbiddenError', async () => {
    let res = await request(app).get('/forbidden');
    expect(res.statusCode).toBe(403);
    expect(res.body.type).toBe('ForbiddenError');

    res = await request(app).get('/forbidden-custom');
    expect(res.body.error).toBe('Custom forbidden');
  });

  it('should handle custom NotFoundError', async () => {
    const res = await request(app).get('/not-found-custom');
    expect(res.body.error).toBe('Custom not found');
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
