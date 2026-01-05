export const DB_NAME = "PlaybackSpace-DB";

// setting cookies options
export const OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "Strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
