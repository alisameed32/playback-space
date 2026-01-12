import mongoose, { isValidObjectId } from "mongoose";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { use } from "react";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  /**
   * ============================================================================
   * 🎯 CONTROLLER LOGIC BLUEPRINT: getAllVideos
   * ============================================================================
   *
   * GOAL: Retrieve videos based on a complex "Feed Algorithm" that handles both
   * search, filtering, and a custom "Mix" recommendation engine.
   *
   * 1. INITIALIZATION
   * - Extract parameters: page, limit, query, sortBy, sortType, userId.
   * - Start an empty Aggregation Pipeline.
   *
   * 2. SEARCH & DISCOVERY (The "Search Layer")
   * - IF 'query' is provided:
   * a. Perform a $lookup on the 'users' collection (Join First Strategy).
   * - Reason: We must search by Channel Name, not just Video Title.
   * b. Match documents where 'query' exists in:
   * - Video Title (Regex)
   * - Video Description (Regex)
   * - Channel Full Name (from the lookup)
   * - ELSE (Default Feed):
   * a. Apply a "Recency Filter" (e.g., limit to videos from the last 2-3 years)
   * to ensure the feed feels fresh.
   *
   * 3. FILTERING (The "Type Layer")
   * - IF 'userId' is provided -> Filter by specific channel owner.
   * - IF 'type' is provided (Video/Channel/Playlist) -> Apply conditional logic
   * (Note: Primarily focuses on 'Video' type for this controller).
   * - ALWAYS filter for isPublished: true (unless admin).
   *
   * 4. SORTING & RANKING (The "Mix Layer")
   * - Calculate 'Rating' dynamically (requires looking up 'likes' collection).
   * - Determine Sort Order:
   * a. IF 'sortBy' is explicit (View Count, Date, Rating) -> Sort by that field.
   * b. IF 'sortBy' is EMPTY -> Apply "Smart Mix" Logic:
   * - Combine Recency, High Views, and High Ratings into a weighted score.
   * - Apply a randomization factor to keep the feed interesting.
   *
   * 5. PAGINATION
   * - Pass the final pipeline to Aggregate Paginate.
   * - Return the result to the frontend.
   * ============================================================================
   */

  const pipeline = [];

  if (!query && !userId && !sortBy && !sortType) {
    // Default Feed Logic
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    pipeline.push(
      {
        $match: {
          isPublished: true,
          createdAt: { $gte: threeYearsAgo },
        },
      },
      {
        // Random score per request
        $addFields: {
          randomScore: { $rand: {} },
        },
      },
      {
        $sort: {
          randomScore: -1,
          createdAt: -1, // tie-breaker
        },
      }
    );
  }

  if (query) {
    // Search Logic
    pipeline.push(
      // 1. LOOKUP: Fetch Channel + Subscriber Count
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "channelsDetails",
          pipeline: [
            // A. Get Subscriber Count (Nested Lookup)
            {
              $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
              },
            },
            // B. Calculate Count
            {
              $addFields: {
                subscriberCount: { $size: "$subscribers" },
              },
            },
            // C. Clean up (Project only what we need)
            {
              $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                subscriberCount: 1,
              },
            },
          ],
        },
      },
      // 2. UNWIND: Flatten the array so we can search it
      {
        $unwind: "$channelsDetails",
      },
      // 3. GLOBAL MATCH: Search Title OR Description OR Channel Name
      {
        $match: {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { "channelsDetails.fullName": { $regex: query, $options: "i" } }, // <--- Channel Search works here!
          ],
        },
      }
    );
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
