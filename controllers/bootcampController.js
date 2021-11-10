const Bootcamp = require("../models/bootcampModel");
const ErrorResponse = require("../utils/errorResponse");

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();
    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

// @desc Create new Bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
      success: true,
      data: bootcamp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update Bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

// @desc Delete Bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};
