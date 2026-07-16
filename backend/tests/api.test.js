/**
 * @file api.test.js
 * @description Integration test suite for StadiumPulse AI REST API.
 *
 * Test categories:
 *   1. Health check
 *   2. Stadium data endpoints
 *   3. Authentication – register / login / getMe flows
 *   4. Protected route enforcement
 *   5. Input validation error handling
 *
 * @module tests/api
 */

'use strict';

// Set environment variables before server load to ensure instant fallback to local JSON Mock DB
process.env.MONGODB_URI = '';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { app, server } = require('../server');
const db = require('../config/db');
const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

/** Wait until the DB layer (Mongo or JSON mock) has finished initialising. */
beforeAll(async () => {
  const deadline = Date.now() + 8_000;
  while (!db.isInitialized() && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generates a unique test user to prevent conflicts between test runs.
 *
 * @returns {{ username: string, email: string, password: string, role: string }}
 */
const makeTestUser = () => {
  const uid = Date.now();
  return {
    username: `testuser_${uid}`,
    email: `testuser_${uid}@example.com`,
    password: 'Test1234',
    role: 'fan',
  };
};

// ---------------------------------------------------------------------------
// 1 – Health check
// ---------------------------------------------------------------------------

describe('Health Check', () => {
  test('GET /health returns status UP with database field', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('timestamp');
  });
});

// ---------------------------------------------------------------------------
// 2 – Stadium endpoints
// ---------------------------------------------------------------------------

describe('Stadium Endpoints', () => {
  test('GET /api/stadium/points returns a non-empty array of POIs', async () => {
    const res = await request(app).get('/api/stadium/points');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    const poi = res.body[0];
    expect(poi).toHaveProperty('id');
    expect(poi).toHaveProperty('crowdLevel');
  });

  test('GET /api/stadium/route returns a valid path with distance', async () => {
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
});

// ---------------------------------------------------------------------------
// 3 – Auth flow
// ---------------------------------------------------------------------------

describe('Authentication Flow', () => {
  let authToken = '';
  let testUser;

  beforeAll(() => {
    testUser = makeTestUser();
  });

  // 3a – Register
  test('POST /api/auth/register creates a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user).not.toHaveProperty('password');
    authToken = res.body.token;
  });

  // 3b – Duplicate registration
  test('POST /api/auth/register rejects duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('message');
  });

  // 3c – Login with correct credentials
  test('POST /api/auth/login returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('fan');
  });

  // 3d – Login with wrong password
  test('POST /api/auth/login rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  // 3e – Login with unknown email
  test('POST /api/auth/login rejects unknown email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Test1234' });
    expect(res.statusCode).toBe(401);
  });

  // 3f – GET /me with valid token
  test('GET /api/auth/me returns profile when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body).not.toHaveProperty('password');
  });
});

// ---------------------------------------------------------------------------
// 4 – Protected route enforcement
// ---------------------------------------------------------------------------

describe('Protected Route Enforcement', () => {
  test('GET /api/auth/me without token returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me with invalid token returns 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer totally.invalid.token');
    expect(res.statusCode).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// 5 – Input validation
// ---------------------------------------------------------------------------

describe('Input Validation', () => {
  test('POST /api/auth/register rejects a password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'validuser', email: 'valid@test.com', password: '123', role: 'fan' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('POST /api/auth/register rejects a missing username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'nousername@test.com', password: 'Valid123', role: 'fan' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('POST /api/auth/register rejects an invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'bademail', email: 'not-an-email', password: 'Valid123', role: 'fan' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('POST /api/auth/login rejects a missing password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });
});
