import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toggleLikeOnEntity } from "../utils/utils.js";

// =================================
// Video Like Controller Functions
// =================================
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const likeToggled = await toggleLikeOnEntity({
    entityId: videoId,
    entityName: "video",
    userId: req.user._id,
    entityKey: "video",
  });

  res.status(200).json(new ApiResponse(200, likeToggled, "Ok"));
});

// =================================
// Comment Like Controller Functions
// =================================
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const likeToggled = await toggleLikeOnEntity({
    entityId: commentId,
    entityName: "comment",
    userId: req.user._id,
    entityKey: "comment",
  });

  res.status(200).json(new ApiResponse(200, likeToggled, "Ok"));
});

// =================================
// Tweet Like Controller Functions
// =================================
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const likeToggled = await toggleLikeOnEntity({
    entityId: tweetId,
    entityName: "tweet",
    userId: req.user._id,
    entityKey: "tweet",
  });

  res.status(200).json(new ApiResponse(200, likeToggled, "Ok"));
});

// =================================
// Get Liked Videos Controller Function
// =================================
const getLikedVideos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const likedVideos = await Like.aggregate([
    // Stage 1: Get all likes by this user
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },

    // Stage 2: Join with Video collection

    {
      $lookup: {
        from: "Video",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $lookup: {
              from: "User",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          // Unwind ownerDetails within the video lookup
          {
            $unwind: {
              path: "$ownerDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      },
    },

    // Stage 3: Unwind videoDetails

    {
      $unwind: "$videoDetails",
    },

    // Stage 4: Filter for Published videos only

    {
      $match: {
        "videoDetails.isPublished": true,
      },
    },

    // Stage 5: Pagination using Facet

    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },

    // Stage 6: Flatten metadata array for cleaner response
    {
      $unwind: {
        path: "$metadata",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  // Handle case where no videos are found
  const result = likedVideos[0];
  const videos = result.data;
  const total = result.metadata ? result.metadata.total : 0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
      "Liked videos fetched successfully"
    )
  );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
