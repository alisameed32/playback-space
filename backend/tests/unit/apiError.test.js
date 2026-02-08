import { ApiError } from "../../src/utils/apiError.js";

describe("ApiError Utility", () => {
  test("should create an instance of ApiError with default values", () => {
    const error = new ApiError(500);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Something went wrong");
    expect(error.errors).toEqual([]);
    expect(error.success).toBe(false);
  });

  test("should create an instance of ApiError with provided values", () => {
    const statusCode = 400;
    const message = "Invalid input";
    const errors = ["Field required"];
    const stack = "Custom stack trace";

    const error = new ApiError(statusCode, message, errors, stack);

    expect(error.statusCode).toBe(statusCode);
    expect(error.message).toBe(message);
    expect(error.errors).toEqual(errors);
    expect(error.stack).toBe(stack);
    expect(error.success).toBe(false);
  });

  test("should capture stack trace if not provided", () => {
    const error = new ApiError(404);
    expect(error.stack).toBeDefined();
  });
});
