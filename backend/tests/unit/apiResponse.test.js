import { ApiResponse } from "../../src/utils/apiResponse.js";

describe("ApiResponse Utility", () => {
  test("should create an instance of ApiResponse with default message", () => {
    const statusCode = 200;
    const data = { id: 1, name: "Test" };
    const response = new ApiResponse(statusCode, data);

    expect(response).toBeInstanceOf(ApiResponse);
    expect(response.statusCode).toBe(statusCode);
    expect(response.data).toEqual(data);
    expect(response.message).toBe("Request successful");
    expect(response.success).toBe(true);
  });

  test("should create an instance of ApiResponse with custom message", () => {
    const statusCode = 201;
    const data = { id: 2 };
    const message = "Created successfully";
    const response = new ApiResponse(statusCode, data, message);

    expect(response.statusCode).toBe(statusCode);
    expect(response.message).toBe(message);
    expect(response.success).toBe(true);
  });

  test("should set success to false for status codes >= 400", () => {
    // Note: Typically ApiResponse is used for success, but checking logic
    const statusCode = 400;
    const data = null;
    const response = new ApiResponse(statusCode, data);

    expect(response.success).toBe(false);
  });
});
