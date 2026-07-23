const request = require('supertest');
const express = require('express');
const { catchAsync } = require('../../src/utils/catchAsync');
const { errorHandler } = require('../../src/middleware/errorHandler');

describe('catchAsync wrapper', () => {
  it('should catch rejected promises and pass to next()', async () => {
    const app = express();
    
    app.get('/test', catchAsync(async (req, res) => {
      throw new Error('Async error!');
    }));
    
    app.use(errorHandler);
    
    const res = await request(app).get('/test');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
  });
});
