/**
 * Scan endpoint tests. Mocks axios so these tests don't require the Python
 * AI service to be running.
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("axios");
const axios = require("axios");

let app;
let mongod;
let token;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_SECRET = "test-secret";
  process.env.AI_SERVICE_URL = "http://localhost:8000";

  await mongoose.connect(process.env.MONGO_URI);
  app = require("../src/app");

  const res = await request(app).post("/api/auth/register").send({
    name: "Scan Tester",
    email: "scantest@example.com",
    password: "password123",
  });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("Scan API", () => {
  it("requires authentication", async () => {
    const res = await request(app)
      .post("/api/scans/message")
      .send({ text: "hello" });
    expect(res.status).toBe(401);
  });

  it("scans a message and stores the result", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        riskScore: 91,
        riskLevel: "HIGH_RISK",
        category: "Lottery Scam",
        reasons: ["Requests upfront payment", "Urgent language"],
      },
    });

    const res = await request(app)
      .post("/api/scans/message")
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "You won ₹50,000! Pay ₹999 now." });

    expect(res.status).toBe(201);
    expect(res.body.riskScore).toBe(91);
    expect(res.body.riskLevel).toBe("HIGH_RISK");
  });

  it("returns scan history for the authenticated user", async () => {
    const res = await request(app)
      .get("/api/scans")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("records feedback on a scan", async () => {
    const listRes = await request(app)
      .get("/api/scans")
      .set("Authorization", `Bearer ${token}`);
    const scanId = listRes.body[0]._id;

    const res = await request(app)
      .patch(`/api/scans/${scanId}/feedback`)
      .set("Authorization", `Bearer ${token}`)
      .send({ feedback: "correct" });

    expect(res.status).toBe(200);
    expect(res.body.feedback).toBe("correct");
  });

  it("rejects invalid feedback values", async () => {
    const listRes = await request(app)
      .get("/api/scans")
      .set("Authorization", `Bearer ${token}`);
    const scanId = listRes.body[0]._id;

    const res = await request(app)
      .patch(`/api/scans/${scanId}/feedback`)
      .set("Authorization", `Bearer ${token}`)
      .send({ feedback: "maybe" });

    expect(res.status).toBe(400);
  });
});
