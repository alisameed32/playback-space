import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

// ==============================
// Get channel statistics
// ==============================
const getChannelStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    // Stage 1: Match videos by the channel owner`
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user.id) },
    },
    // Stage 2: Lookup videos uploaded by the channel owner
    {
      $lookup: {
        from: "Video",
        localField: "_id",
        foreignField: "owner",
        as: "videos",

        // Stage 3: For each video, lookup likes to count total likes

        pipeline: [
          {
            $lookup: {
              from: "Like",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $addFields: {
              totalLikes: { $size: "$likes" },
            },
          },
        ],
      },
    },
    // Stage 4: Lookup subscriptions to count total subscribers
    {
      $lookup: {
        from: "Subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    // Stage 5: Calculate totals
    {
      $addFields: {
        totalSubscribers: { $size: "$subscribers" },
        totalVideos: { $size: "$videos" },
        totalViews: { $sum: "$videos.views" },
        totalLikes: { $sum: "$videos.totalLikes" },
      },
    },
    // Stage 6: Project the required fields
    {
      $project: {
        totalVideos: 1,
        totalViews: 1,
        totalLikes: 1,
        totalSubscribers: 1,
        username: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);

  if (stats.length < 1) {
    throw new ApiError(400, "channel not found");
  }

  res
    .status(200)
    .json(new ApiResponse("Channel stats fetched successfully", stats[0]));
});

// ==============================
// Get channel videos
// ==============================
const getChannelVideos = asyncHandler(async (req, res) => {
  const videos = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(req.user.id) },
    },
    {
      $lookup: {
        from: "Like",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        totalLikes: { $size: "$likes" },
      },
    },
    {
      $project: {
        likes: 0, // Exclude the likes array from the final output
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse("Channel videos fetched successfully", videos));
});

export { getChannelStats, getChannelVideos };
