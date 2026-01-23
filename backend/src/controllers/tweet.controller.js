import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyTweetOwnership } from "../utils/utils.js";

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
    .json(new ApiResponse(201, "Tweet created successfully", newTweet));
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
    .json(new ApiResponse(200, "User tweets fetched successfully", tweets));
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
    .json(new ApiResponse(200, "Tweet updated successfully", tweet));
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
    .json(new ApiResponse(200, "Tweet deleted successfully", deleteTweet));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
