const Course = require("../models/courseModel");
const Bootcamp = require("../models/bootcampModel");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc Get courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/Courses
// @access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc Get Single Course
// @route GET /api/v1/course/:id
// @access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      404
    );
  }
  // Send json response
  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc Add a course
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  // Check to see if bootcamp exits
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
      404
    );
  }
  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to this bootcamp ${bootcamp.id}`,
        401
      )
    );
  }
  // Create Course
  const course = await Course.create(req.body);
  // Send json response
  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc Update course
// @route PUT /api/v1/courses/:id
// @access Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  // Check to see if bootcamp exits
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      404
    );
  }
  // Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to  update course ${course.id}`,
        401
      )
    );
  }
  // Update Course
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  // Send json response
  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc Delete Course
// @route DELETE /api/v1/courses/:id
// @access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const courseId = req.params.id;
  const course = await Course.findById(courseId);
  if (!course) {
    return next(
      new ErrorResponse(`Resource not found with ID of ${courseId}`, 404)
    );
  }
  // Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add delete course ${course.id}`,
        401
      )
    );
  }
  // Delete Course from database
  course.remove();
  res.status(201).json({
    success: true,
    data: `Course with the id of ${courseId} has been removed`,
  });
});
