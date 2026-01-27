import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyTweetOwnership } from "../utils/utils.js";

// =================================
// Get All Tweets
// =================================
const getAllTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.aggregate([
    { $sort: { createdAt: -1 } },
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
              avatar: 1,
              username: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$ownerDetails" },
    {
      $lookup: {
        from: "Like",
        let: { tweetId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$tweet", "$$tweetId"] },
            },
          },
        ],
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "Comment",
        let: { tweetId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$tweet", "$$tweetId"] },
            },
          },
        ],
        as: "comments",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        commentsCount: { $size: "$comments" },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        ownerDetails: 1,
        likesCount: 1,
        commentsCount: 1,
        isLiked: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "All tweets fetched successfully"));
});

// =================================
// Create Tweet
// =================================
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Tweet content cannot be empty");
  }

  const newTweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newTweet, "Tweet created successfully"));
});

// =================================
// Get User Tweets
// =================================
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  //const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

  const tweets = await Tweet.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    { $sort: { createdAt: -1 } },
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
              avatar: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$ownerDetails" },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        ownerDetails: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

// =================================
// Update Tweet
// =================================
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Tweet content cannot be empty");
  }

  const tweet = await verifyTweetOwnership(tweetId, req.user._id);

  tweet.content = content;

  await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

// =================================
// Delete Tweet
// =================================
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const tweet = await verifyTweetOwnership(tweetId, req.user._id);
  const deleteTweet = await tweet.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, deleteTweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet, getAllTweets };
