import { asyncHandler } from "../../src/utils/asyncHandler.js";
import { jest } from '@jest/globals';

describe("asyncHandler Utility", () => {
  test("should call the passed function", async () => {
    const mockHandler = jest.fn().mockResolvedValue("success");
    const req = {};
    const res = {};
    const next = jest.fn();

    const wrappedHandler = asyncHandler(mockHandler);
    await wrappedHandler(req, res, next);

    expect(mockHandler).toHaveBeenCalledWith(req, res, next);
  });

  test("should catch errors and pass them to next", async () => {
    const error = new Error("Async error");
    const mockHandler = jest.fn().mockRejectedValue(error);
    const req = {};
    const res = {};
    const next = jest.fn();

    const wrappedHandler = asyncHandler(mockHandler);
    await wrappedHandler(req, res, next);

    expect(mockHandler).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(error);
  });
});
