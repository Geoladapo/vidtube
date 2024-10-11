import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/videos.model.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  //TODO: get all videos based on query, sort, pagination
  // Pagination
  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * pageSize;

  // Sorting
  const sortOrder = sortType === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  // Building Query filter
  const filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId provided");
    }
    filter.userId = userId;
  }

  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(pageSize);

  const totalVideos = await Video.countDocuments(filter);

  if (!videos.length) {
    return res.status(404).json(new ApiResponse(404, "No videos found", []));
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        page: pageNumber,
        totalPages: Math.ceil(totalVideos / pageSize),
        totalVideos,
      },
      "Videos fetched successfully"
    )
  );
});
