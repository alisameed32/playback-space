import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

playlistSchema.index({ owner: 1, createdAt: -1 });
playlistSchema.index({ isPublic: 1 });
playlistSchema.index({ owner: 1, isPublic: 1 });

export const Playlist = mongoose.model("Playlist", playlistSchema, "Playlist");
