/**
 * Auth endpoint tests.
 *
 * Requires `mongodb-memory-server` as a dev dependency so tests don't touch
 * a real database:
 *   npm install --save-dev mongodb-memory-server
 *
 * Run with: npm test
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let app;
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_SECRET = "test-secret";
  process.env.AI_SERVICE_URL = "http://localhost:8000";

  await mongoose.connect(process.env.MONGO_URI);
  app = require("../src/app");
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("Auth API", () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  it("rejects registration with a short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...testUser, password: "short" });
    expect(res.status).toBe(400);
  });

  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.email).toBe(testUser.email);
  });

  it("rejects duplicate registration", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(400);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });

  it("returns the current user's profile when authenticated", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    const token = loginRes.body.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  it("rejects profile access without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
