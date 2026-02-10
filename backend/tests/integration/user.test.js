import request from "supertest";
import { app } from "../../src/app.js";
import { User } from "../../src/models/user.model.js";
import { uploadOnCloudinary } from "../../src/utils/cloudinary.js";
import mongoose from "mongoose";

// Mock Cloudinary
jest.mock("../../src/utils/cloudinary.js", () => ({
  uploadOnCloudinary: jest.fn(),
  deleteOnCloudinary: jest.fn(),
}));

describe("User Routes Integration Tests", () => {
    
  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
      // Close mongoose connection if needed, though supertest usually handles app
      await mongoose.connection.close();
  });

  describe("POST /api/v1/users/register", () => {
    it("should register a new user successfully", async () => {
      // Mock Cloudinary response
      uploadOnCloudinary.mockResolvedValue({
        url: "https://cloudinary.com/dummy-avatar.jpg",
      });

      const userData = {
        fullName: "Test User",
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };

      // Note: We need to attach files for this endpoint because validation requires avatar
      // Using .attach() from supertest
      
      const response = await request(app)
        .post("/api/v1/users/register")
        .field("fullName", userData.fullName)
        .field("email", userData.email)
        .field("username", userData.username)
        .field("password", userData.password)
        .attach("avatar", Buffer.from("dummy image"), "avatar.jpg"); 

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.avatar).toBe("https://cloudinary.com/dummy-avatar.jpg");
    });

    it("should fail if required fields are missing", async () => {
      const response = await request(app)
        .post("/api/v1/users/register")
        .send({
          email: "test@example.com", 
          // Missing username, etc.
        });

      // Expect 400 or whatever validation error code is used
      expect(response.status).toBe(400); 
    });
  });
});
