import { Video } from "../models/video.model.js";
import { Playlist } from "../models/playlist.model.js";
import { isValidObjectId } from "mongoose";
import { ApiError } from "./apiError.js";

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
