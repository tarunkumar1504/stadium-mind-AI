const request = require('supertest');
const { app, server } = require('../server');
const db = require('../config/db');

// Ensure database is connected (offline JSON fallback is fine)
beforeAll(async () => {
  const startTime = Date.now();
  while (!db.isInitialized() && Date.now() - startTime < 6000) {
    await new Promise(resolve => setTimeout(resolve, 150));
  }
});

afterAll(done => {
  // Close the server to avoid open handles
  server.close(done);
});

describe('StadiumPulse AI API Endpoints Test Suite', () => {
  
  // 1. Health check test
  test('GET /health should return system status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body).toHaveProperty('database');
  });

  // 2. Fetching stadium points POIs
  test('GET /api/stadium/points should return point lists', async () => {
    const res = await request(app).get('/api/stadium/points');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('crowdLevel');
  });

  // 3. Dynamic route finding calculation
  test('GET /api/stadium/route should return optimal path coords', async () => {
    const res = await request(app)
      .get('/api/stadium/route')
      .query({ start: 'gate_b', end: 'seat_n', accessibility: 'false' });
      
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('path');
    expect(res.body).toHaveProperty('distance');
    expect(Array.isArray(res.body.path)).toBe(true);
    expect(res.body.path.length).toBeGreaterThan(1);
    expect(res.body.path[0].id).toBe('gate_b');
  });

  // 4. Register new user validation
  test('POST /api/auth/register should fail on short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'jest_tester',
        email: 'jest@test.com',
        password: '123',
        role: 'fan'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

});
