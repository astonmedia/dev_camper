const Bootcamp = require("../models/bootcampModel");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;
  // Copy request query
  const reqQuery = { ...req.query };

  // Create array of fields to exclude in the filter
  const removeFields = ["select", "sort", "limit", "page"];
  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);
  // Convert query to a string
  let queryStr = JSON.stringify(reqQuery);
  // Find query param and add '$' in front of it
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  // Create the find method with query params
  query = Bootcamp.find(JSON.parse(queryStr));
  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();
  query = query.skip(startIndex).limit(limit);
  // Query Model with above filter
  const bootcamps = await query;

  // Pagination Result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  // Send json response
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
});

// @desc Get single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcampId = req.params.id;
  const bootcamp = await Bootcamp.findById(bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Resource not found with ID of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc Create new Bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc Update Bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcampId = req.params.id;
  const bootcamp = await Bootcamp.findByIdAndUpdate(bootcampId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Resource not found with ID of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc Delete Bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcampId = req.params.id;
  const bootcamp = await Bootcamp.findByIdAndDelete(bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Resource not found with ID of ${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    data: `Bootcamp with the id of ${bootcampId} has been removed`,
  });
});

// @desc Get Bootcamp's within a radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance/:unit
// @access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance, unit } = req.params;
  // Get Lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  // Calc radius using radians
  // Divide distance by radius of earth
  // Radius of Earth = 3963 mi || 6378 km
  // Use either miles or km's
  let radius;
  if (unit === "km") {
    radius = distance / 6378;
  } else if (unit === "mi") {
    radius = distance / 3963;
  }
  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
