import { Video } from "../models/video.model.js";
import { Playlist } from "../models/playlist.model.js";
import { isValidObjectId } from "mongoose";
import { ApiError } from "./apiError.js";
import { Tweet } from "../models/tweet.model.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";
/**
 * Finds playlist and verifies user owns it
 * @throws {ApiError} 404 if playlist not found
 * @throws {ApiError} 403 if user doesn't own playlist
 */
export const verifyPlaylistOwnership = async (playlistId, userId) => {
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "You don't have permission to modify this playlist"
    );
  }

  return playlist; // Return the playlist if all checks pass
};

/**
 * Verifies video exists in database
 * @throws {ApiError} 400 if invalid ID format
 * @throws {ApiError} 404 if video not found
 */
export const verifyVideoExists = async (videoId) => {
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return video;
};

/**
 *
 * Verifies tweet ownership
 * @throws {ApiError} 400 if invalid ID format
 * @throws {ApiError} 404 if tweet not found
 * @throws {ApiError} 403 if user doesn't own tweet
 */
export const verifyTweetOwnership = async (tweetId, userId) => {
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Forbidden: You do not own this tweet");
  }

  return tweet;
};

/**
 * Verifies comment ownership
 * @throws {ApiError} 400 if invalid ID format
 * @throws {ApiError} 404 if comment not found
 * @throws {ApiError} 403 if user doesn't own comment
 */

export const verifyCommentOwnership = async (commentId, userId, Comment) => {
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not the owner of this comment");
  }

  return comment;
};

/**
 * Helper function to add comment to either video or tweet
 * @throws {ApiError} 400 if both or neither videoId and tweetId are provided
 * @throws {ApiError} 404 if video or tweet not found
 * @throws {ApiError} 500 if comment creation fails
 */
export const addCommentToEntity = async ({
  entityId,
  userId,
  EntityModel,
  content,
  CommentModel,
  entityKey, // Explicitly tell the DB which field to populate (e.g., "video", "tweet")
}) => {
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  if (!isValidObjectId(entityId)) {
    throw new ApiError(400, "Invalid Entity ID");
  }

  const entity = await EntityModel.findById(entityId);

  if (!entity) {
    throw new ApiError(404, "Target entity (Video/Tweet) not found");
  }

  const newComment = await CommentModel.create({
    content,
    owner: userId,
    [entityKey]: entityId,
  });

  if (!newComment) {
    throw new ApiError(500, "Failed to create comment");
  }

  await newComment.save();

  return newComment;
};

/**
 * Helper function to get comments for either video or tweet
 * @throws {ApiError} 400 if invalid ID format
 * @throws {ApiError} 404 if video or tweet not found
 */
export const getCommentsForEntity = async ({
  entityId,
  page,
  limit,
  entityKey,
  CommentModel,
}) => {
  if (!isValidObjectId(entityId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const commentsAggregate = await CommentModel.aggregate([
    {
      $match: { [entityKey]: new mongoose.Types.ObjectId(entityId) },
    },
    {
      // $facet allows running multiple pipelines in parallel
      $facet: {
        // Pipeline 1: Get the Total Count
        metadata: [{ $count: "totalDocs" }],

        // Pipeline 2: Get the Data (Pagination first, then Lookup)
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limitNumber },
          {
            $lookup: {
              from: "User",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          { $unwind: "$ownerDetails" },
        ],
      },
    },
  ]);

  const result = commentsAggregate[0];
  const comments = result.data;
  const totalDocs = result.metadata[0] ? result.metadata[0].totalDocs : 0;

  // 3. Fix: Calculate pagination HERE, since we have limitNumber here
  const totalPages = Math.ceil(totalDocs / limitNumber);

  // Return everything the controller needs
  return { comments, totalDocs, totalPages, currentPage: pageNumber };
};

/**
 * Helper function to toggle like on either video, comment, or tweet
 * @throws {ApiError} 400 if both or neither videoId, commentId, tweetId are provided
 * @throws {ApiError} 404 if target entity not found
 */

export const toggleLikeOnEntity = async ({
  entityId,
  entityName,
  userId,
  entityKey, // Explicitly tell the DB which field to populate (e.g., "video", "comment", "tweet")
}) => {
  if (!entityId) {
    throw new ApiError(400, `${entityName} ID is required`);
  }

  if (!isValidObjectId(entityId)) {
    throw new ApiError(400, `Invalid ${entityName} ID`);
  }

  const isLiked = await Like.findOne({
    [entityKey]: entityId,
    likedBy: userId,
  });

  if (!isLiked) {
    const newLike = await Like.create({
      [entityKey]: entityId,
      likedBy: userId,
    });
    await newLike.save();

    return { message: `${entityName} like toggled successfully` };
  } else {
    await Like.deleteOne({ _id: isLiked._id });

    return { message: `${entityName} unlike toggled successfully` };
  }
};
