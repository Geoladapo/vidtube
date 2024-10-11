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

export const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  // TODO: get video, upload to cloudinary, create video
  // Validation
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title and description are required");
  }

  console.warn(req.files);
  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailFileLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is missing");
  }

  if (!thumbnailFileLocalPath) {
    throw new ApiError(400, "Thumbnail file is missing");
  }

  // upload video to Cloudinary
  let uploadVideo;
  try {
    uploadVideo = await uploadOnCloudinary(videoFileLocalPath);
    console.log("Uploading video: ", uploadVideo);
  } catch (error) {
    console.log("Error uploading video", error);
    throw new ApiError(500, "Failed to upload video");
  }

  let thumbnail;
  try {
    thumbnail = await uploadOnCloudinary(thumbnailFileLocalPath);
    console.log("Uploading thumbnail: ", thumbnail);
  } catch (error) {
    console.log("Error uploading video", error);
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  // Creating the video in the database
  try {
    const video = Video.create({
      title,
      description,
      videoUrl: uploadedVideo.url,
      publicId: uploadedVideo.public_id,
      uploadedBy: req.user._id,
    });

    const createdVideo = await Video.findById(video._id).populate(
      "uploadedBy",
      "username email"
    );

    if (!createdVideo) {
      throw new ApiError(
        500,
        "Something went wrong while publishing the video"
      );
    }

    res
      .status(201)
      .json(new ApiResponse(201, createdVideo, "Video published successfully"));
  } catch (error) {
    console.log("Video creation failed");

    if (uploadedVideo) {
      await deleteFromCloudinary(uploadedVideo.public_id);
    }

    throw new ApiError(500, "Failed to publish video and video was deleted");
  }
});
