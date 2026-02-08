import request from "supertest";
import { app } from "../../src/app.js";

describe("Healthcheck API", () => {
  test("GET /api/v1/healthcheck should return 200 and OK status", async () => {
    const response = await request(app)
      .get("/api/v1/healthcheck")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body.statusCode).toBe(200);
    expect(response.body.message).toBe("Health check OK");
    expect(response.body.success).toBe(true);
  });
});
