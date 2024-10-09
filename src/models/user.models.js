import mongoose from "mongoose";

const userschema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    avatar: { type: String, required: true },
    coverImage: { types: String },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: { type: String, required: [true, "Password is required"] },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userschema);
