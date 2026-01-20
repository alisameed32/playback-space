import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";

// ===================================================
// Controller Functions for Video
// ===================================================
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const matchStage = {};

  // Search by title or description
  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // Filter by userId (owner)
  if (userId) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid User ID");
    }
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  matchStage.isPublished = true;

  const sortStage = {};
  sortStage[sortBy] = sortType === "asc" ? 1 : -1;

  // Aggregation Pipeline
  const videos = await Video.aggregate([
    // Stage 1: Match
    { $match: matchStage },

    // Stage 2: Lookup to join with User collection
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
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },

    // Stage 3: Unwind the ownerDetails array
    {
      $unwind: {
        path: "$ownerDetails", // The field to unwind
        preserveNullAndEmptyArrays: true, // Now it's a valid option inside $unwind
      },
    },

    // Stage 4: Sort
    { $sort: sortStage },

    // Stage 5: Facet for pagination
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limitNumber }],
      },
    },
  ]);

  const result = videos[0];
  const totalDocs = result.metadata[0] ? result.metadata[0].total : 0;
  const videoData = result.data;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos: videoData,
        pagination: {
          total: totalDocs,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalDocs / limitNumber),
        },
      },
      "Videos fetched successfully"
    )
  );
});

// ===================================================
// Publish a New Video
// ===================================================
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    throw new ApiError(400, "Video title is required");
  }

  if (!req.files.videoFile && !req.files.thumbnail) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  const localVideoPath = req.files?.videoFile?.[0]?.path;
  const localThumbnailPath = req.files?.thumbnail?.[0]?.path;

  const videoFile = await uploadOnCloudinary(localVideoPath);
  const thumbnail = await uploadOnCloudinary(localThumbnailPath);

  if (!videoFile) {
    throw new ApiError(500, "Video upload failed");
  }

  const newVideo = await Video.create({
    videoFile: videoFile.secure_url,
    thumbnail: thumbnail ? thumbnail.secure_url : "",
    owner: req.user._id,
    title,
    description,
    duration: videoFile.duration || 0,
    isPublished: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video published successfully"));
});

// ===================================================
// Get Video by ID
// ===================================================
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  const video = await Video.findById(videoId).populate(
    "owner",
    "username fullName avatar"
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

// ===================================================
// Update Video Details
// ===================================================
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }
  const video = await Video.findById(videoId);
  const oldThumbnailUrl = video.thumbnail;

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not the owner of this video");
  }

  const { title, description } = req.body;

  if (title) video.title = title;
  if (description) video.description = description;

  const localThumbnailPath = req.file?.path;

  if (localThumbnailPath) {
    const thumbnail = await uploadOnCloudinary(localThumbnailPath);
    if (thumbnail) {
      video.thumbnail = thumbnail.secure_url;
    }
  }

  if (oldThumbnailUrl && oldThumbnailUrl !== video.thumbnail) {
    await deleteOnCloudinary(oldThumbnailUrl, "image");
  }

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

// ===================================================
// Delete Video
// ===================================================
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const video = await Video.findById(videoId);
  const oldThumbnailUrl = video.thumbnail;
  const oldVideoUrl = video.videoFile;

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not the owner of this video");
  }

  const deletedVideo = await Video.deleteOne({ _id: videoId });

  if (deletedVideo.deletedCount > 0) {
    // Now it is safe to delete files
    if (oldThumbnailUrl) await deleteOnCloudinary(oldThumbnailUrl, "image");
    if (oldVideoUrl) await deleteOnCloudinary(oldVideoUrl, "video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
});

// ===================================================
// Toggle Publish Status
// ===================================================
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not the owner of this video");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `Video has been ${video.isPublished ? "published" : "unpublished"}`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
