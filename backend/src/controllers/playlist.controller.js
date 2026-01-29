import mongoose, { isValidObjectId, Mongoose } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  verifyPlaylistOwnership,
  verifyVideoExists,
} from "../utils/utils.js";

// =================================
// Playlist Controllers
// =================================
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, isPublic = true } = req.body;

  if (!name || name.trim() === "") {
    throw new ApiError(400, "Playlist name is required");
  }

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
    isPublic: isPublic,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Playlist created successfully", newPlaylist));
});

// =================================
// User Playlists
// =================================
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const isOwner = req.user?._id.toString() === userId;

  const matchCondition = {
    owner: new mongoose.Types.ObjectId(userId),
    ...(isOwner ? {} : { isPublic: true }),
  };

  const playlists = await Playlist.aggregate([
    // stage
    {
      $match: matchCondition,
    },
    // stage 2: lookup videos
    {
      $lookup: {
        from: "Video",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $limit: 1,
          },
          {
            $project: {
              thumbnail: 1,
            },
          },
        ],
      },
    },

    // Stage 3: Calculate Metadata
    {
      $addFields: {
        totalVideos: { $size: "$videos" }, // Counts the IDs in the local array
        playlistThumbnail: {
          $cond: {
            if: { $gt: [{ $size: "$videos" }, 0] },
            then: { $first: "$videos.thumbnail" },
            else: null,
          },
        },
      },
    },

    // Stage 4: Clean Response (Exclude heavy arrays)
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        totalVideos: 1,
        isPublic: 1,
        playlistThumbnail: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },

    // Stage 5: Sort (Newest created first)
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

// =================================
// Get Playlist by ID
// =================================
const getPlaylistById = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "Authentication required");
  }

  const { playlistId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  // 1. Calculate Pagination Logic
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Page and limit must be positive numbers");
  }

  if (limitNumber > 100) {
    throw new ApiError(400, "Limit cannot exceed 100 items per page");
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required");
  }

  const playlistVideos = await Playlist.aggregate([
    // Stage 1: Match Playlist by ID
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },

    // Stage 2: Security Check (Public OR Owner)
    {
      $match: {
        $or: [
          { isPublic: true },
          { owner: new mongoose.Types.ObjectId(req.user._id) },
        ],
      },
    },

    // Stage 3: Pagination for Videos Array
    // Calculate totalVideos and slice videos array
    {
      $addFields: {
        totalVideos: { $size: "$videos" }, // Count total IDs (e.g. 500)
        videos: { $slice: ["$videos", skip, limitNumber] }, // Keep only 20 IDs
      },
    },

    // Stage 4: Lookup Video Details
    // Fetch video details for the sliced video IDs
    // and lookup the video owner (author)
    {
      $lookup: {
        from: "Video",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
              thumbnail: 1,
              videoFile: 1,
              duration: 1,
              views: 1,
              createdAt: 1,
              owner: 1,
            },
          },
          // Lookup the Video Creator (Author)
          {
            $lookup: {
              from: "User",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [{ $project: { fullName: 1, avatar: 1 } }],
            },
          },
          { $addFields: { owner: { $first: "$owner" } } },
        ],
      },
    },

    // Stage 4: Lookup Playlist Owner Details
    {
      $lookup: {
        from: "User",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
      },
    },
    { $addFields: { owner: { $first: "$owner" } } },

    // Stage 5: Final Project
    {
      $project: {
        name: 1,
        description: 1,
        videos: 1,
        owner: 1,
        totalVideos: 1,
        createdAt: 1,
        updatedAt: 1,
        isPublic: 1,
      },
    },
  ]);

  if (!playlistVideos?.length) {
    throw new ApiError(404, "Playlist not found");
  }

  const playlist = playlistVideos[0];
  const totalPages = Math.ceil(playlist.totalVideos / limitNumber);

  return res.status(200).json(
    new ApiResponse(200, "Playlist fetched successfully", {
      playlist: {
        _id: playlist._id,
        name: playlist.name,
        description: playlist.description,
        videos: playlist.videos,
        owner: playlist.owner,
        isPublic: playlist.isPublic,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
      },
      pagination: {
        currentPage: pageNumber,
        totalPages: totalPages,
        totalVideos: playlist.totalVideos,
        videosPerPage: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    })
  );
});

// =================================
// Add Video to Playlist
// =================================
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await verifyPlaylistOwnership(playlistId, req.user._id);
  await verifyVideoExists(videoId);

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already exists in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Video added to playlist successfully", playlist)
    );
});

// =================================
// Remove Video from Playlist
// =================================
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await verifyPlaylistOwnership(playlistId, req.user._id);
  await verifyVideoExists(videoId);

  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video does not exist in playlist");
  }

  playlist.videos.pull(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Video removed from playlist successfully", playlist)
    );
});

// =================================
// Delete Playlist
// =================================
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await verifyPlaylistOwnership(playlistId, req.user._id);
  await playlist.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist deleted successfully", null));
});

// =================================
// Update Playlist
// =================================
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  const playlist = await verifyPlaylistOwnership(playlistId, req.user._id);

  if (name) playlist.name = name;
  if (description) playlist.description = description;

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist updated successfully", playlist));
});

// ===================================================
// Toggle Public Status
// ===================================================
const togglePublicStatus = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await verifyPlaylistOwnership(playlistId, req.user._id);

  playlist.isPublic = !playlist.isPublic;
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        `Playlist has been ${playlist.isPublic ? "made public" : "made private"}`
      )
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  togglePublicStatus,
};
