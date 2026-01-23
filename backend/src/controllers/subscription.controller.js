import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ===============================
// Controller to toggle subscription
// ===============================
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }

  const isSubscribed = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (!isSubscribed) {
    // Create new subscription
    const newSubscription = new Subscription({
      subscriber: req.user._id,
      channel: channelId,
    });
    await newSubscription.save();
  } else {
    // Remove existing subscription
    await Subscription.deleteOne({
      subscriber: req.user._id,
      channel: channelId,
    });
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        isSubscribed ? "Unsubscribed" : "Subscribed",
        "Subscription toggled successfully"
      )
    );
});

// ===================================
// Controller to get subscribers of a channel (Its like who subscribed to me)
// ===================================
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: "User",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$subscriberDetails" },
    {
      $group: {
        _id: null,
        subscribers: { $push: "$subscriberDetails" },
        subscribersCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        subscribers: 1,
        subscribersCount: 1,
      },
    },
  ]);

  const result = subscribers[0] || { subscribers: [], subscribersCount: 0 };

  res
    .status(200)
    .json(new ApiResponse(200, result, "Subscribers fetched successfully"));
});

// ===================================
// Controller to get channels a user is subscribed to (It like whom I subscribed to)
// ===================================
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(400, "Subscriber ID is required");
  }

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid Subscriber ID");
  }

  const channels = await Subscription.aggregate([
    {
      $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
    },
    {
      $lookup: {
        from: "User",
        localField: "channel",
        foreignField: "_id",
        as: "channelDetails",
        pipeline: [
          {
            $project: {
              _id: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$channelDetails" },
    {
      $group: {
        _id: null,
        channels: { $push: "$channelDetails" },
        channelsCount: { $sum: 1 },
      },
    },
  ]);

  const result = channels[0] || { channels: [], channelsCount: 0 };

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Subscribed channels fetched successfully")
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
