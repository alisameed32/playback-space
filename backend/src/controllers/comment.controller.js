import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import {
  verifyCommentOwnership,
  addCommentToEntity,
  getCommentsForEntity,
} from "../utils/validation.js";
import { Tweet } from "../models/tweet.model.js";

// =============================
// Get comments for a video
// =============================
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const commentsAggregate = await getCommentsForEntity({
    entityId: videoId,
    page,
    limit,
    entityKey: "video",
    CommentModel: Comment,
  });

  const result = commentsAggregate[0];
  const comments = result.data;
  const totalDocs = result.metadata[0] ? result.metadata[0].totalDocs : 0;

  const totalPages = Math.ceil(totalDocs / limitNumber);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comments, totalDocs, totalPages, currentPage: pageNumber },
        "Comments fetched successfully"
      )
    );
});

// =============================
// Get comments for a tweet
// =============================
const getTweetComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const comments = await getCommentsForEntity({
    entityId: videoId,
    page,
    limit,
    entityKey: "tweet",
    CommentModel: Comment,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

// =============================
// Add a comment to a video
// =============================
const addVideoComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  const newComment = await addCommentToEntity({
    entityId: videoId,
    userId: req.user._id,
    EntityModel: Video,
    CommentModel: Comment,
    content,
    entityKey: "video",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment added successfully"));
});

// =============================
// Add a comment to a video
// =============================
const addTweetComment = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  const newComment = await addCommentToEntity({
    entityId: tweetId,
    userId: req.user._id,
    EntityModel: Tweet,
    CommentModel: Comment,
    content,
    entityKey: "tweet",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment added successfully"));
});

// =============================
// Update a comment
// =============================
const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  const comment = verifyCommentOwnership(
    req.params.commentId,
    req.user._id,
    Comment
  );

  comment.content = content;
  await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const comment = await verifyCommentOwnership(
    commentId,
    req.user._id,
    Comment
  );

  await comment.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export {
  getVideoComments,
  addVideoComment,
  addTweetComment,
  updateComment,
  deleteComment,
};
